from typing import List
from app.engine.guardrails import GuardrailResult
from app.schemas.models import CustomerProfile, CustomerState, FinancialSignals


def generate_plain_english_explanation(
    customer: CustomerProfile,
    signals: FinancialSignals,
    state: CustomerState,
    guardrail: GuardrailResult,
) -> str:
    """
    Generates a human-friendly, transparent 'Why' explanation
    in plain words without complex banking jargon.
    """
    if not customer.consent_given:
        return "We cannot analyze your financial health until you grant consent under privacy regulations."

    if state == CustomerState.FRAUD_RISK:
        return (
            "We spotted an unusual transaction that deviates sharply from your regular hours and amounts. "
            "To safeguard your money, we have flagged this for immediate verification."
        )

    if state == CustomerState.STRESSED:
        reasons = []
        if signals.missed_emi_count > 0:
            reasons.append("a missed or bounced EMI payment")
        if signals.foir >= 0.60:
            reasons.append(f"over {signals.foir * 100:.0f}% of your monthly income going to existing loan dues")
        if signals.balance_trend in ("sharp_decline", "declining"):
            reasons.append("a declining account balance")

        reasons_str = " and ".join(reasons) if reasons else "high debt commitments"
        return (
            f"Saarthi noticed {reasons_str}. In accordance with our anti-predatory banking charter, "
            f"we have blocked all new loan offers and activated debt restructuring support to protect your financial stability."
        )

    if state == CustomerState.VULNERABLE:
        return (
            f"Your fixed obligations (FOIR) are at {signals.foir * 100:.0f}% and your monthly savings rate is "
            f"{signals.savings_rate * 100:.0f}%. We recommend tightening expenses before taking on any further commitments."
        )

    # Healthy
    return (
        f"Your income is steady, your debt obligations are low ({signals.foir * 100:.0f}% FOIR), and you have "
        f"a healthy monthly surplus (savings rate: {signals.savings_rate * 100:.0f}%). "
        f"Growing these idle funds in a disciplined savings plan helps beat inflation."
    )
