"""SAARTHI data-service: SQLite-backed synthetic customers + demo event levers.

Dumb storage + generator. Amounts are signed integer rupees: credit +, debit -.
No financial-state scoring here — downstream services read these rows and decide
state. Injected events just append distinctively-typed rows.
"""
from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
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
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                customer_id INTEGER REFERENCES customers(id),
                created_at TEXT NOT NULL
            );
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
        # Seed one login per persona so the demo has real accounts to sign in with.
        # Names deliberately match the email prefix — no faker-generated aliases,
        # so "ramesh@saarthi.in" logs in as "Ramesh Kumar".
        users_already = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if not users_already:
            today = date.today().isoformat()
            seed_creds = [
                (1, "ramesh@saarthi.in", "ramesh@123", "Ramesh Kumar"),
                (2, "priya@saarthi.in",  "priya@123",  "Priya Sharma"),
                (3, "amit@saarthi.in",   "amit@123",   "Amit Patel"),
                (4, "sunita@saarthi.in", "sunita@123", "Sunita Devi"),
            ]
            for cid, email, pwd, real_name in seed_creds:
                # Skip if the customer row is missing (defensive).
                if not conn.execute("SELECT 1 FROM customers WHERE id=?", (cid,)).fetchone():
                    continue
                # Replace the generator's faker name so the display name matches
                # the credential used to log in.
                conn.execute("UPDATE customers SET name=? WHERE id=?", (real_name, cid))
                salt = secrets.token_hex(16)
                pwd_hash = _hash_password(pwd, salt)
                conn.execute(
                    "INSERT INTO users (email, password_hash, salt, customer_id,"
                    " created_at) VALUES (?,?,?,?,?)",
                    (email, pwd_hash, salt, cid, today),
                )
        conn.commit()
    finally:
        conn.close()


def _hash_password(password: str, salt: str) -> str:
    """PBKDF2-HMAC-SHA256, stdlib only. 100k iters is enough for a demo."""
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
    ).hex()


def _verify_password(password: str, salt: str, expected_hash: str) -> bool:
    return hmac.compare_digest(_hash_password(password, salt), expected_hash)


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


# ===================================================================
# Auth — demo-grade only. Password hashing (PBKDF2) is real; there is
# no JWT/session — the frontend keeps a customer_id in localStorage.
# ponytail: no tokens, browser holds the identity. Upgrade path: swap
# to signed cookies / JWT when this ever leaves demo land.
# ===================================================================
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    occupation: str = "Salaried"
    city: str = "Bengaluru"
    monthly_income: int = 40000
    persona_type: str = "stable_salaried"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    customer_id: int
    email: str
    name: str


_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


def _email_norm(email: str) -> str:
    return email.strip().lower()


def _valid_email(email: str) -> bool:
    return bool(_EMAIL_RE.match(email)) and len(email) <= 254


@app.post("/auth/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    email = _email_norm(body.email)
    if not _valid_email(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Please provide your name.")
    conn = get_db()
    try:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise HTTPException(status_code=409, detail="email already registered")
        today = date.today().isoformat()
        cur = conn.execute(
            "INSERT INTO customers (name, persona_type, occupation, city,"
            " monthly_income, created_at) VALUES (?,?,?,?,?,?)",
            (body.name, body.persona_type, body.occupation, body.city,
             body.monthly_income, today),
        )
        customer_id = cur.lastrowid
        salt = secrets.token_hex(16)
        conn.execute(
            "INSERT INTO users (email, password_hash, salt, customer_id, created_at)"
            " VALUES (?,?,?,?,?)",
            (email, _hash_password(body.password, salt), salt, customer_id, today),
        )
        conn.commit()
        return AuthResponse(customer_id=customer_id, email=email, name=body.name)
    finally:
        conn.close()


@app.get("/customers/{customer_id}/summary")
def customer_summary(customer_id: int):
    """Cheap check the dashboard uses to decide whether to show onboarding.
    is_new = the customer has no transactions on record."""
    conn = get_db()
    try:
        row = _require_customer(conn, customer_id)
        n = conn.execute(
            "SELECT COUNT(*) FROM transactions WHERE customer_id=?", (customer_id,)
        ).fetchone()[0]
        return {
            "customer_id": customer_id,
            "name": row["name"],
            "transaction_count": n,
            "is_new": n == 0,
            "monthly_income": row["monthly_income"],
        }
    finally:
        conn.close()


@app.post("/auth/login", response_model=AuthResponse)
def login(body: LoginRequest):
    email = _email_norm(body.email)
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT u.password_hash, u.salt, u.customer_id, c.name"
            " FROM users u JOIN customers c ON c.id = u.customer_id"
            " WHERE u.email = ?",
            (email,),
        ).fetchone()
        if not row or not _verify_password(body.password, row["salt"], row["password_hash"]):
            raise HTTPException(status_code=401, detail="invalid credentials")
        return AuthResponse(
            customer_id=row["customer_id"], email=email, name=row["name"]
        )
    finally:
        conn.close()
