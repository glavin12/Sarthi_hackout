from typing import Tuple, List
from app.core.config import settings
from app.schemas.models import CustomerState, FinancialSignals


def classify_customer_state(
    signals: FinancialSignals,
) -> Tuple[CustomerState, List[str]]:
    """
    Transparent Rule-Based State Classification.
    Prioritizes safety and financial wellbeing:
    1. Fraud Risk: Active unverified anomaly detected.
    2. Stressed: Missed EMI / Severe debt burden (FOIR > 60%) / Depleting funds.
    3. Vulnerable: Moderate debt burden (FOIR 45-60%) / Low savings / Declining balance.
    4. Healthy: Sustainable debt (<45%), healthy savings (>=15%), stable/growing balance.

    Returns: (CustomerState, list_of_triggers)
    """
    triggers: List[str] = []

    # 1. Fraud Risk Check
    if signals.is_fraud_anomaly_detected:
        triggers.append("Unusual high-value or late-night transaction anomaly detected.")
        return CustomerState.FRAUD_RISK, triggers

    # 2. Financial Stress Checks
    if signals.missed_emi_count > 0:
        triggers.append(f"{signals.missed_emi_count} missed/bounced EMI payment(s) detected.")
        return CustomerState.STRESSED, triggers

    if signals.foir >= settings.STRESSED_FOIR_THRESHOLD:
        triggers.append(
            f"Severe debt burden: FOIR is {signals.foir * 100:.1f}% (threshold is {settings.STRESSED_FOIR_THRESHOLD * 100:.0f}%)."
        )
        return CustomerState.STRESSED, triggers

    if signals.savings_rate <= 0.0 and signals.balance_trend in ("sharp_decline", "declining"):
        triggers.append("Negative savings combined with declining account balance.")
        return CustomerState.STRESSED, triggers

    # 3. Vulnerable Checks
    if signals.foir >= settings.VULNERABLE_FOIR_THRESHOLD:
        triggers.append(
            f"Elevated debt obligations: FOIR is {signals.foir * 100:.1f}%."
        )
        return CustomerState.VULNERABLE, triggers

    if signals.savings_rate < settings.HEALTHY_SAVINGS_RATE_MIN:
        triggers.append(
            f"Thin savings cushion: savings rate is {signals.savings_rate * 100:.1f}%."
        )
        return CustomerState.VULNERABLE, triggers

    if signals.balance_trend in ("declining", "sharp_decline"):
        triggers.append("Account balance is showing a downward trend.")
        return CustomerState.VULNERABLE, triggers

    # 4. Healthy
    triggers.append(
        f"Stable finances: Healthy savings rate of {signals.savings_rate * 100:.1f}% and FOIR at {signals.foir * 100:.1f}%."
    )
    return CustomerState.HEALTHY, triggers
