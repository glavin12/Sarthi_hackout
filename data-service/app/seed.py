"""Synthetic persona + 18-month transaction generation.

Pure data: emits customer dicts with a list of transaction dicts. No state
scoring lives here (that's a downstream service). Amounts are signed integer
rupees: credits positive, debits negative.

Generation is seeded (SEED below) so the demo is reproducible run-to-run.
"""
from __future__ import annotations

import random
from datetime import date

from faker import Faker

SEED = 42
MONTHS = 18  # months of history ending in the current month

# Each persona is a config the generator reads. Kept declarative so tweaking a
# persona's shape is editing numbers, not code.
PERSONAS = [
    {
        "persona_type": "stable_salaried",
        "occupation": "Software Engineer",
        "income": 60000,          # steady monthly salary
        "income_regular": True,
        "rent": 15000,
        "emis": [("Home Loan", 12000)],
        "groceries": 6000,
        "utilities": 2200,
        "upi_per_month": (8, 14),  # count range
        "upi_amount": (100, 900),
    },
    {
        "persona_type": "gig_worker",
        "occupation": "Ride-share Driver",
        "income": 35000,          # irregular; split into several credits
        "income_regular": False,
        "rent": 10000,
        "emis": [("Bike Loan", 3500)],
        "groceries": 5000,
        "utilities": 1500,
        "upi_per_month": (10, 20),
        "upi_amount": (80, 600),
    },
    {
        "persona_type": "small_business",
        "occupation": "Shop Owner",
        "income": 90000,          # lumpy large credits
        "income_regular": False,
        "rent": 20000,
        "emis": [("Business Loan", 15000)],
        "groceries": 9000,
        "utilities": 3500,
        "upi_per_month": (15, 30),
        "upi_amount": (200, 2500),
    },
    {
        "persona_type": "near_stress_family",
        "occupation": "Clerk",
        "income": 40000,          # steady but barely covers obligations
        "income_regular": True,
        "rent": 14000,
        "emis": [("Home Loan", 11000), ("Personal Loan", 6000)],
        "groceries": 9000,
        "utilities": 3000,
        "upi_per_month": (10, 18),
        "upi_amount": (100, 700),
    },
]


def _month_starts(today: date, n: int) -> list[date]:
    """First-of-month dates for the last `n` months, oldest first, ending in
    today's month."""
    starts = []
    y, m = today.year, today.month
    for _ in range(n):
        starts.append(date(y, m, 1))
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return list(reversed(starts))


def _day(month_start: date, day: int) -> str:
    """Clamp a day-of-month to a valid date within the month and return ISO text."""
    day = min(day, 28)  # every month has 28 days; avoids month-length edge cases
    return month_start.replace(day=day).isoformat()


def _generate_transactions(cfg: dict, rng: random.Random, month_starts: list[date],
                           today: date) -> list[dict]:
    txns: list[dict] = []

    def add(d: str, amount: int, ttype: str, desc: str, anomaly: int = 0):
        txns.append({"date": d, "amount": amount, "type": ttype,
                     "description": desc, "is_anomaly": anomaly})

    for ms in month_starts:
        # --- income (credit +) ---
        if cfg["income_regular"]:
            add(_day(ms, 1), cfg["income"], "salary",
                f"Salary credit - {cfg['occupation']}")
        else:
            # irregular: split into 3-6 variable credits across the month
            n = rng.randint(3, 6)
            remaining = int(cfg["income"] * rng.uniform(0.7, 1.25))  # lean/rich months
            for i in range(n):
                part = remaining // (n - i)
                part = int(part * rng.uniform(0.6, 1.4))
                add(_day(ms, rng.randint(2, 27)), max(part, 500), "income",
                    "Payout / business income")
                remaining -= part

        # --- rent (debit -) ---
        add(_day(ms, 5), -cfg["rent"], "rent", "Monthly rent")

        # --- EMIs ---
        for lender, amt in cfg["emis"]:
            add(_day(ms, 7), -amt, "emi", f"EMI - {lender}")

        # --- utilities ---
        add(_day(ms, 10), -cfg["utilities"], "utilities", "Electricity / mobile / water")

        # --- groceries: 2-3 chunks/month ---
        chunks = rng.randint(2, 3)
        for _ in range(chunks):
            amt = cfg["groceries"] // chunks
            add(_day(ms, rng.randint(3, 27)), -int(amt * rng.uniform(0.8, 1.2)),
                "groceries", "Groceries / supermarket")

        # --- UPI: many small debits ---
        lo, hi = cfg["upi_per_month"]
        for _ in range(rng.randint(lo, hi)):
            amt = rng.randint(*cfg["upi_amount"])
            add(_day(ms, rng.randint(1, 28)), -amt, "upi", "UPI payment")

    # --- occasional historical anomaly (~40% of personas get one) ---
    if rng.random() < 0.4:
        ms = rng.choice(month_starts)
        add(_day(ms, rng.randint(1, 28)), -rng.randint(20000, 45000),
            "suspicious_debit", "Unusual debit (02:14) - unknown merchant", anomaly=1)

    # Drop future-dated rows (current month's later days) so history ends today
    # and an injected today-dated event is the newest transaction.
    iso_today = today.isoformat()
    txns = [t for t in txns if t["date"] <= iso_today]
    txns.sort(key=lambda t: t["date"])
    return txns


def build_dataset() -> list[dict]:
    """Return list of customer dicts, each with a `transactions` list."""
    faker = Faker("en_IN")
    faker.seed_instance(SEED)
    rng = random.Random(SEED)
    today = date.today()
    month_starts = _month_starts(today, MONTHS)

    customers = []
    for cfg in PERSONAS:
        customers.append({
            "name": faker.name(),
            "persona_type": cfg["persona_type"],
            "occupation": cfg["occupation"],
            "city": faker.city(),
            "monthly_income": cfg["income"],
            "transactions": _generate_transactions(cfg, rng, month_starts, today),
        })
    return customers


if __name__ == "__main__":  # quick self-check
    data = build_dataset()
    assert len(data) == 4, "expected 4 personas"
    for c in data:
        assert c["transactions"], f"{c['persona_type']} has no transactions"
        assert any(t["amount"] > 0 for t in c["transactions"]), "no income credit"
        assert any(t["amount"] < 0 for t in c["transactions"]), "no debits"
    print(f"OK: {len(data)} personas, "
          f"{sum(len(c['transactions']) for c in data)} transactions total")
