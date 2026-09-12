"""Adapters to convert Data Service wire format → Decision Engine internal models."""
from datetime import datetime
from app.schemas.models import CustomerProfile, Transaction

# Map data-service type strings to DE category + direction
_TYPE_MAP = {
    "salary": ("SALARY", "CREDIT"),
    "income": ("SALARY", "CREDIT"),
    "rent": ("RENT", "DEBIT"),
    "emi": ("EMI", "DEBIT"),
    "emi_missed": ("EMI", "DEBIT"),
    "groceries": ("GROCERIES", "DEBIT"),
    "utilities": ("UTILITIES", "DEBIT"),
    "upi": ("DISCRETIONARY", "DEBIT"),
    "suspicious_debit": ("OTHER", "DEBIT"),
}


def adapt_customer(raw: dict) -> CustomerProfile:
    """Convert data-service customer JSON to Decision Engine CustomerProfile."""
    return CustomerProfile(
        customer_id=str(raw["id"]),
        name=raw["name"],
        consent_given=True,
        stated_monthly_income=float(raw["monthly_income"]),
    )


def adapt_transaction(raw: dict) -> Transaction:
    """Convert a single data-service transaction JSON to Decision Engine Transaction."""
    ds_type = raw.get("type", "other")
    category, direction = _TYPE_MAP.get(ds_type, ("OTHER", "CREDIT" if raw.get("amount", 0) > 0 else "DEBIT"))
    amount = abs(raw.get("amount", 0))
    
    # Parse date string to datetime
    date_str = raw.get("date", "2025-01-01")
    try:
        ts = datetime.fromisoformat(date_str)
    except (ValueError, TypeError):
        ts = datetime(2025, 1, 1)
    
    # Determine status
    status = "SUCCESS"
    if ds_type == "emi_missed":
        status = "BOUNCED"
    
    return Transaction(
        txn_id=str(raw.get("id", "")),
        customer_id=str(raw.get("customer_id", "")),
        timestamp=ts,
        amount=float(amount),
        type=direction,
        category=category,
        merchant=raw.get("description", ""),
        balance_after_txn=0.0,
        is_recurring=ds_type in ("salary", "income", "rent", "emi"),
        status=status,
    )


def adapt_transactions(raw_list: list[dict]) -> list[Transaction]:
    """Convert a list of data-service transactions."""
    txns = [adapt_transaction(r) for r in raw_list]
    # Compute running balance
    balance = 0.0
    for t in sorted(txns, key=lambda x: x.timestamp):
        if t.type == "CREDIT":
            balance += t.amount
        else:
            balance -= t.amount
        t.balance_after_txn = balance
    return txns
