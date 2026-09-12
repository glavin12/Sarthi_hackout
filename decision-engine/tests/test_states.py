import pytest
from app.engine.pipeline import run_decision_engine
from app.schemas.models import ActionType, CustomerState
from tests.fixtures.personas import (
    get_fraud_priya,
    get_healthy_ramesh,
    get_stressed_ramesh,
)


def test_healthy_persona_state_and_nba():
    """Act 1: Healthy customer gets positive savings recommendation."""
    customer, transactions = get_healthy_ramesh()
    nba = run_decision_engine(customer, transactions)

    assert nba.state == CustomerState.HEALTHY
    assert nba.action == ActionType.RECOMMEND_PRODUCT
    assert nba.guardrail_applied is False
    assert nba.signals.savings_rate > 0.15
    assert nba.signals.foir < 0.45
    assert nba.recommended_product is not None
    assert "High-Yield" in nba.recommended_product or "Savings" in nba.recommended_product


def test_stressed_persona_state_detection():
    """Act 2: Stressed customer properly detected via FOIR and missed EMI."""
    customer, transactions = get_stressed_ramesh()
    nba = run_decision_engine(customer, transactions)

    assert nba.state == CustomerState.STRESSED
    assert nba.signals.missed_emi_count >= 1
    assert nba.signals.foir > 0.50


def test_fraud_persona_state_detection():
    """Act 4: IsolationForest catches the 3 AM high-value debit outlier."""
    customer, transactions = get_fraud_priya()
    nba = run_decision_engine(customer, transactions)

    assert nba.state == CustomerState.FRAUD_RISK
    assert nba.signals.is_fraud_anomaly_detected is True
    assert nba.action == ActionType.FRAUD_ALERT_VERIFY
