from typing import Optional
from app.schemas.models import ActionType, CustomerProfile, CustomerState, FinancialSignals


class CandidateAction:
    def __init__(
        self,
        action: ActionType,
        title: str,
        message: str,
        recommended_product: Optional[str] = None,
        is_commercial_loan: bool = False,
    ):
        self.action = action
        self.title = title
        self.message = message
        self.recommended_product = recommended_product
        self.is_commercial_loan = is_commercial_loan


def select_candidate_nba(
    customer: CustomerProfile, signals: FinancialSignals, state: CustomerState
) -> CandidateAction:
    """
    Selects candidate Next-Best-Action before ethical guardrail enforcement.
    Demonstrates standard opportunity-driven bank actions:
    - Healthy: Wealth generation / savings plans.
    - Vulnerable: Spending review / budgeting assistance.
    - Stressed: Standard commercial banks often push pre-approved loans here.
                We deliberately candidate a loan so the Guardrail proves its value by blocking it!
    """
    if state == CustomerState.FRAUD_RISK:
        return CandidateAction(
            action=ActionType.FRAUD_ALERT_VERIFY,
            title="Suspicious Activity Detected",
            message="We noticed an unusual transaction that differs from your typical pattern.",
            recommended_product=None,
            is_commercial_loan=False,
        )

    if state == CustomerState.STRESSED:
        # Standard commercial banking logic would attempt a loan upsell:
        # "You have high expenses, get a pre-approved loan of ₹2,00,000!"
        return CandidateAction(
            action=ActionType.RECOMMEND_PRODUCT,
            title="Pre-Approved Instant Personal Loan",
            message="Get ₹2,00,000 instantly in your account with zero documentation.",
            recommended_product="Pre-Approved Personal Loan (₹2,00,000 @ 14.5%)",
            is_commercial_loan=True,
        )

    if state == CustomerState.VULNERABLE:
        return CandidateAction(
            action=ActionType.BUDGETING_ASSISTANCE,
            title="Smart Budgeting & Dues Review",
            message="Upcoming dues are higher this month. Let's optimize your monthly cashflow.",
            recommended_product="Automated Bill Calendar & Expense Categorizer",
            is_commercial_loan=False,
        )

    # Healthy state
    if signals.savings_amount >= 5000:
        return CandidateAction(
            action=ActionType.RECOMMEND_PRODUCT,
            title="Start a High-Yield Long-Term Savings Plan",
            message="Your income is steady and you have ₹8,000+ surplus each month. Put it to work!",
            recommended_product="High-Yield Recurring Deposit (7.25% p.a.)",
            is_commercial_loan=False,
        )
    else:
        return CandidateAction(
            action=ActionType.RECOMMEND_PRODUCT,
            title="Build Your 3-Month Emergency Cushion",
            message="Keep a safe liquid fund for unexpected expenses.",
            recommended_product="Liquid Savings Buffer",
            is_commercial_loan=False,
        )
