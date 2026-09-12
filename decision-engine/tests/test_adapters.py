import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from app.adapters import adapt_customer, adapt_transaction, adapt_transactions
from app.main import app

client = TestClient(app)


def test_adapt_customer():
    raw_customer = {
        "id": 1,
        "name": "Ramesh Patel",
        "persona_type": "stable_salaried",
        "occupation": "Software Engineer",
        "city": "Mumbai",
        "monthly_income": 60000,
    }
    customer = adapt_customer(raw_customer)
    assert customer.customer_id == "1"
    assert customer.name == "Ramesh Patel"
    assert customer.consent_given is True
    assert customer.stated_monthly_income == 60000.0


def test_adapt_transaction():
    raw_credit = {
        "id": 1,
        "customer_id": 1,
        "date": "2025-08-01",
        "amount": 60000,
        "type": "salary",
        "description": "Salary credit",
        "is_anomaly": 0,
    }
    t = adapt_transaction(raw_credit)
    assert t.txn_id == "1"
    assert t.customer_id == "1"
    assert t.amount == 60000.0
    assert t.type == "CREDIT"
    assert t.category == "SALARY"
    assert t.is_recurring is True
    assert t.status == "SUCCESS"
    assert t.timestamp == datetime(2025, 8, 1)

    raw_debit = {
        "id": 2,
        "customer_id": 1,
        "date": "2025-08-05",
        "amount": -15000,
        "type": "rent",
        "description": "Monthly rent",
        "is_anomaly": 0,
    }
    t2 = adapt_transaction(raw_debit)
    assert t2.txn_id == "2"
    assert t2.customer_id == "1"
    assert t2.amount == 15000.0
    assert t2.type == "DEBIT"
    assert t2.category == "RENT"
    assert t2.is_recurring is True

    raw_missed = {
        "id": 3,
        "customer_id": 1,
        "date": "2025-08-07",
        "amount": 0,
        "type": "emi_missed",
        "description": "EMI missed",
        "is_anomaly": 0,
    }
    t3 = adapt_transaction(raw_missed)
    assert t3.status == "BOUNCED"
    assert t3.category == "EMI"


def test_adapt_transactions_balance():
    raw_txns = [
        {"id": 2, "customer_id": 1, "date": "2025-08-05", "amount": -15000, "type": "rent", "description": "Rent"},
        {"id": 1, "customer_id": 1, "date": "2025-08-01", "amount": 60000, "type": "salary", "description": "Salary"},
    ]
    adapted = adapt_transactions(raw_txns)
    assert len(adapted) == 2
    # Should be sorted chronologically for balance
    # Aug 1: +60000 -> 60000
    # Aug 5: -15000 -> 45000
    sal_txn = next(t for t in adapted if t.txn_id == "1")
    rent_txn = next(t for t in adapted if t.txn_id == "2")
    assert sal_txn.balance_after_txn == 60000.0
    assert rent_txn.balance_after_txn == 45000.0


def test_evaluate_intent_healthy():
    resp = client.post(
        "/evaluate-intent",
        json={"customer_id": "CUST_RAMESH_HEALTHY", "proposed_action": "loan_request"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is True
    assert data["state"] == "healthy"


def test_evaluate_intent_stressed_blocks_loan():
    resp = client.post(
        "/evaluate-intent",
        json={"customer_id": "CUST_RAMESH_STRESSED", "proposed_action": "loan_request"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is False
    assert data["state"] == "stressed"
    assert "Debt Burden" in data["reason"] or len(data["reason"]) > 0
    assert data["support_options"] is not None
    assert len(data["support_options"]) > 0


def test_evaluate_intent_stressed_allows_non_loan():
    resp = client.post(
        "/evaluate-intent",
        json={"customer_id": "CUST_RAMESH_STRESSED", "proposed_action": "balance_check"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is True
    assert data["state"] == "stressed"


def test_evaluate_intent_fraud_blocks_loan():
    resp = client.post(
        "/evaluate-intent",
        json={"customer_id": "CUST_PRIYA_FRAUD", "proposed_action": "apply_loan"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is False
    assert data["state"] == "fraud_risk"
