import pytest
from app.engine.guardrails import apply_ethics_guardrail
from app.engine.nba import CandidateAction, select_candidate_nba
from app.engine.pipeline import run_decision_engine
from app.schemas.models import ActionType, CustomerProfile, CustomerState, FinancialSignals
from tests.fixtures.personas import (
    get_fraud_priya,
    get_healthy_ramesh,
    get_stressed_ramesh,
)


def test_guardrail_blocks_loan_upsell_when_customer_is_stressed():
    """
    THE DEMO MONEY-SHOT TEST:
    Assert that when a customer is under financial stress,
    any commercial loan upsell is strictly blocked by the Ethics Guardrail
    and converted to debt restructuring / support.
    """
    customer, transactions = get_stressed_ramesh()
    nba = run_decision_engine(customer, transactions)

    # Assert state is stressed
    assert nba.state == CustomerState.STRESSED

    # Assert guardrail intervened
    assert nba.guardrail_applied is True
    assert nba.blocked_action is not None
    assert "Blocked Predatory Upsell" in nba.blocked_action

    # Assert loan is NOT recommended
    assert nba.action == ActionType.DEBT_SUPPORT_CALL
    assert nba.recommended_product is None
    assert nba.support_options is not None
    assert len(nba.support_options) > 0

    # Assert plain-English reason explains the block
    assert "anti-predatory banking charter" in nba.plain_english_reason
    assert "blocked all new loan offers" in nba.plain_english_reason


def test_guardrail_blocks_profiling_without_consent():
    """DPDP Act 2023 Compliance: Block personalized recommendations if consent is False."""
    customer, transactions = get_healthy_ramesh()
    customer.consent_given = False

    nba = run_decision_engine(customer, transactions)

    assert nba.guardrail_applied is True
    assert nba.action == ActionType.DO_NOTHING
    assert "Consent" in nba.title
    assert "DPDP Act 2023" in nba.message


def test_fraud_anomaly_takes_priority_over_product_marketing():
    """Priority 2 check: Fraud anomaly overrides commercial recommendations."""
    customer, transactions = get_fraud_priya()
    nba = run_decision_engine(customer, transactions)

    assert nba.state == CustomerState.FRAUD_RISK
    assert nba.guardrail_applied is True
    assert nba.action == ActionType.FRAUD_ALERT_VERIFY
    assert nba.priority_rank == 2
    assert "Security Alert" in nba.title
