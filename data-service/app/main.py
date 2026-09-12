"""SAARTHI data-service: SQLite-backed synthetic customers + demo event levers.

Dumb storage + generator. Amounts are signed integer rupees: credit +, debit -.
No financial-state scoring here — downstream services read these rows and decide
state. Injected events just append distinctively-typed rows.
"""
from __future__ import annotations

import os
import sqlite3
from contextlib import asynccontextmanager
from datetime import date
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .seed import START_BALANCE, build_dataset

DB_PATH = os.environ.get("DATA_DB_PATH", "data.db")


def get_db() -> sqlite3.Connection:
    # ponytail: per-request connect + SQLite; fine for demo scale, swap to a pool
    # if it ever serves real load.
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_and_seed() -> None:
    conn = get_db()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                persona_type TEXT NOT NULL,
                occupation TEXT NOT NULL,
                city TEXT NOT NULL,
                monthly_income INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL REFERENCES customers(id),
                date TEXT NOT NULL,
                amount INTEGER NOT NULL,
                type TEXT NOT NULL,
                description TEXT NOT NULL,
                is_anomaly INTEGER NOT NULL DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_txn_customer ON transactions(customer_id);
            """
        )
        already = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
        if not already:
            today = date.today().isoformat()
            for c in build_dataset():
                cur = conn.execute(
                    "INSERT INTO customers (name, persona_type, occupation, city,"
                    " monthly_income, created_at) VALUES (?,?,?,?,?,?)",
                    (c["name"], c["persona_type"], c["occupation"], c["city"],
                     c["monthly_income"], today),
                )
                cid = cur.lastrowid
                conn.executemany(
                    "INSERT INTO transactions (customer_id, date, amount, type,"
                    " description, is_anomaly) VALUES (?,?,?,?,?,?)",
                    [(cid, t["date"], t["amount"], t["type"], t["description"],
                      t["is_anomaly"]) for t in c["transactions"]],
                )
        conn.commit()
    finally:
        conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_and_seed()
    yield


app = FastAPI(title="SAARTHI data-service", version="1.0.0", lifespan=lifespan)

# Browser (frontend) and sibling services call this directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- response / request models ---
class Customer(BaseModel):
    id: int
    name: str
    persona_type: str
    occupation: str
    city: str
    monthly_income: int


class Transaction(BaseModel):
    id: int
    customer_id: int
    date: str
    amount: int
    type: str
    description: str
    is_anomaly: int


class Event(str, Enum):
    missed_emi = "missed_emi"
    income_drop = "income_drop"
    suspicious_debit = "suspicious_debit"
    salary_hike = "salary_hike"


class InjectRequest(BaseModel):
    event: Event


def _require_customer(conn: sqlite3.Connection, customer_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="customer not found")
    return row


# --- endpoints ---
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "data-service"}


@app.get("/customers", response_model=list[Customer])
def list_customers():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM customers ORDER BY id").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.get("/customers/{customer_id}", response_model=Customer)
def get_customer(customer_id: int):
    conn = get_db()
    try:
        return dict(_require_customer(conn, customer_id))
    finally:
        conn.close()


@app.get("/customers/{customer_id}/transactions", response_model=list[Transaction])
def get_transactions(customer_id: int):
    conn = get_db()
    try:
        _require_customer(conn, customer_id)
        rows = conn.execute(
            "SELECT * FROM transactions WHERE customer_id = ?"
            " ORDER BY date DESC, id DESC",
            (customer_id,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.post("/customers/{customer_id}/inject-event", response_model=list[Transaction])
def inject_event(customer_id: int, body: InjectRequest):
    """Append the row(s) representing a demo event and return them. Additive:
    events persist; downstream services detect state from the row type/flag."""
    conn = get_db()
    try:
        customer = _require_customer(conn, customer_id)
        today = date.today().isoformat()
        income = customer["monthly_income"]

        # (amount, type, description, is_anomaly)
        rows_to_add: list[tuple] = []
        if body.event is Event.missed_emi:
            rows_to_add.append((0, "emi_missed", "EMI payment missed - Home Loan", 0))
        elif body.event is Event.income_drop:
            rows_to_add.append((income // 2, "salary",
                                "Salary credit (revised - reduced)", 0))
        elif body.event is Event.suspicious_debit:
            # >= 50k so the /api/v1 late-night (02:47) fraud heuristic fires for
            # every persona regardless of income.
            amt = max(60000, int(income * 1.5))
            rows_to_add.append((-amt, "suspicious_debit",
                                "Unusual debit (02:47) - unrecognised merchant", 1))
        elif body.event is Event.salary_hike:
            rows_to_add.append((int(income * 1.3), "salary",
                                "Salary credit (revised - hike)", 0))

        ids = []
        for amount, ttype, desc, anomaly in rows_to_add:
            cur = conn.execute(
                "INSERT INTO transactions (customer_id, date, amount, type,"
                " description, is_anomaly) VALUES (?,?,?,?,?,?)",
                (customer_id, today, amount, ttype, desc, anomaly),
            )
            ids.append(cur.lastrowid)
        conn.commit()
        placeholders = ",".join("?" * len(ids))
        rows = conn.execute(
            f"SELECT * FROM transactions WHERE id IN ({placeholders})", ids
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


# ===================================================================
# /api/v1 canonical layer — the shape decision-engine consumes.
# Pure mapping over the same stored rows; no separate storage.
# credit/debit direction from the sign; category upper-cased; a fixed
# daytime hour keeps normal txns off the fraud late-night heuristic,
# while a suspicious_debit gets a 02:47 timestamp.
# ===================================================================
_CATEGORY_MAP = {
    "salary": "SALARY", "income": "SALARY", "rent": "RENT", "emi": "EMI",
    "emi_missed": "EMI", "groceries": "GROCERIES", "utilities": "UTILITIES",
    "upi": "TRANSFER", "suspicious_debit": "TRANSFER",
}
_RECURRING = {"salary", "rent", "emi"}


class CanonicalTransaction(BaseModel):
    txn_id: str
    customer_id: str
    timestamp: str
    amount: float          # >= 0; direction carried by `type`
    type: str              # CREDIT | DEBIT
    category: str          # UPPERCASE
    merchant: str | None = None
    balance_after_txn: float
    is_recurring: bool = False
    status: str            # SUCCESS | BOUNCED


class CanonicalCustomer(BaseModel):
    customer_id: str
    name: str
    consent_given: bool
    stated_monthly_income: float
    account_created_at: str | None = None


def _to_canonical_customer(row: sqlite3.Row) -> dict:
    return {
        "customer_id": str(row["id"]),
        "name": row["name"],
        "consent_given": True,
        "stated_monthly_income": float(row["monthly_income"]),
        "account_created_at": row["created_at"],
    }


def _to_canonical_txns(customer: sqlite3.Row, rows: list[sqlite3.Row]) -> list[dict]:
    """Map stored rows to the canonical schema, computing a running balance in
    chronological order. `rows` may be in any order; output is newest-first."""
    chrono = sorted(rows, key=lambda r: (r["date"], r["id"]))
    balance = float(START_BALANCE.get(customer["persona_type"], 50000))
    out: list[dict] = []
    for r in chrono:
        balance += r["amount"]  # signed: credit adds, debit subtracts
        stored_type = r["type"]
        hour = "02:47:00" if stored_type == "suspicious_debit" else "10:00:00"
        out.append({
            "txn_id": str(r["id"]),
            "customer_id": str(customer["id"]),
            "timestamp": f"{r['date']}T{hour}",
            "amount": float(abs(r["amount"])),
            "type": "CREDIT" if r["amount"] > 0 else "DEBIT",
            "category": _CATEGORY_MAP.get(stored_type, "OTHER"),
            "merchant": r["description"],
            "balance_after_txn": balance,
            "is_recurring": stored_type in _RECURRING,
            "status": "BOUNCED" if stored_type == "emi_missed" else "SUCCESS",
        })
    out.reverse()  # newest-first
    return out


@app.get("/api/v1/customers/{customer_id}", response_model=CanonicalCustomer,
         tags=["canonical"])
def get_customer_canonical(customer_id: int):
    conn = get_db()
    try:
        return _to_canonical_customer(_require_customer(conn, customer_id))
    finally:
        conn.close()


@app.get("/api/v1/customers/{customer_id}/transactions",
         response_model=list[CanonicalTransaction], tags=["canonical"])
def get_transactions_canonical(customer_id: int):
    conn = get_db()
    try:
        customer = _require_customer(conn, customer_id)
        rows = conn.execute(
            "SELECT * FROM transactions WHERE customer_id = ?", (customer_id,)
        ).fetchall()
        return _to_canonical_txns(customer, rows)
    finally:
        conn.close()
