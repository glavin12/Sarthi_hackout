"""Populate the SQLite DB without booting the API. Run from data-service/:

    python seed_db.py

Reuses the same startup seeding as the server; seeds only if empty (safe to
re-run). Delete data.db first to reseed from scratch.
"""
from app.main import DB_PATH, get_db, init_and_seed

if __name__ == "__main__":
    init_and_seed()
    conn = get_db()
    customers = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
    txns = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
    conn.close()
    print(f"Seeded {DB_PATH}: {customers} customers, {txns} transactions")
