from typing import List
from app.engine.classifier import classify_customer_state
from app.engine.explain import generate_plain_english_explanation
from app.engine.fraud import fraud_detector
from app.engine.guardrails import apply_ethics_guardrail
from app.engine.nba import select_candidate_nba
from app.engine.signals import compute_financial_signals
from app.schemas.models import CustomerProfile, NextBestAction, Transaction


def run_decision_engine(
    customer: CustomerProfile, transactions: List[Transaction]
) -> NextBestAction:
    """
    Executes the Six-Step Saarthi Decision Loop:
    1. Read transactions & calculate financial signals
    2. ML Fraud Anomaly Detection (IsolationForest per customer)
    3. State Classification (Healthy, Vulnerable, Stressed, Fraud Risk)
    4. Candidate Next-Best-Action (NBA) Selection
    5. Ethics & Compliance Guardrail (Block predatory loans when stressed)
    6. Generate Plain-English Explanation and factor traces
    """
    # Step 1: Signals Computation
    signals = compute_financial_signals(customer, transactions)

    # Step 2: Fraud Anomaly Detection (IsolationForest)
    is_anomaly, flagged_txn_id, score = fraud_detector.detect_anomalies(transactions)
    if is_anomaly:
        signals.is_fraud_anomaly_detected = True
        signals.flagged_txn_id = flagged_txn_id
        signals.anomaly_score = score

    # Step 3: State Classification
    state, triggers = classify_customer_state(signals)

    # Step 4: Candidate NBA Selection
    candidate = select_candidate_nba(customer, signals, state)

    # Step 5: Ethics & Anti-Predatory Guardrail
    guardrail_result = apply_ethics_guardrail(customer, signals, state, candidate)

    # Step 6: Plain-English Explainability
    plain_english = generate_plain_english_explanation(
        customer, signals, state, guardrail_result
    )

    return NextBestAction(
        customer_id=customer.customer_id,
        customer_name=customer.name,
        state=state,
        action=guardrail_result.action,
        title=guardrail_result.title,
        message=guardrail_result.message,
        plain_english_reason=plain_english,
        guardrail_applied=guardrail_result.guardrail_applied,
        blocked_action=guardrail_result.blocked_action,
        priority_rank=guardrail_result.priority_rank,
        recommended_product=guardrail_result.recommended_product,
        support_options=guardrail_result.support_options,
        signals=signals,
        explainability_factors=triggers,
    )
