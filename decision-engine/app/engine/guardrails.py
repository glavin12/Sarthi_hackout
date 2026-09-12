from typing import List, Optional
from app.engine.nba import CandidateAction
from app.schemas.models import ActionType, CustomerProfile, CustomerState, FinancialSignals


class GuardrailResult:
    def __init__(
        self,
        action: ActionType,
        title: str,
        message: str,
        guardrail_applied: bool,
        blocked_action: Optional[str],
        priority_rank: int,
        recommended_product: Optional[str] = None,
        support_options: Optional[List[str]] = None,
    ):
        self.action = action
        self.title = title
        self.message = message
        self.guardrail_applied = guardrail_applied
        self.blocked_action = blocked_action
        self.priority_rank = priority_rank
        self.recommended_product = recommended_product
        self.support_options = support_options


def apply_ethics_guardrail(
    customer: CustomerProfile,
    signals: FinancialSignals,
    state: CustomerState,
    candidate: CandidateAction,
) -> GuardrailResult:
    """
    Ethics & Compliance Guardrail (Layer ④ of Saarthi Architecture).
    Enforces the Fixed Priority Principle:
    1. Consent (DPDP Act 2023)
    2. Fraud / Security
    3. Financial Distress (Anti-predatory loan block - DEMO MONEY SHOT)
    4. Essential Financial Assistance
    5. Eligibility
    6. Customer Benefit
    7. Product Recommendation
    8. Commercial Opportunity (Lowest Priority)
    """

    # Priority 1: Consent Check (DPDP Act 2023)
    if not customer.consent_given:
        return GuardrailResult(
            action=ActionType.DO_NOTHING,
            title="Consent Required for Personalized Banking",
            message="In compliance with the DPDP Act 2023, Saarthi requires your explicit consent before analyzing account signals.",
            guardrail_applied=True,
            blocked_action="All Personalized Recommendations Blocked (Missing Consent)",
            priority_rank=1,
            recommended_product=None,
            support_options=None,
        )

    # Priority 2: Fraud / Security Check
    if state == CustomerState.FRAUD_RISK:
        return GuardrailResult(
            action=ActionType.FRAUD_ALERT_VERIFY,
            title="🚨 Security Alert: Unusual Transaction Detected",
            message="Saarthi detected an abnormal debit outside your normal spending patterns. Please verify if you authorized this.",
            guardrail_applied=True,
            blocked_action="All Marketing & Upsell Offers Blocked (Active Security Flag)",
            priority_rank=2,
            recommended_product=None,
            support_options=[
                "Confirm transaction was authorized",
                "Immediately freeze card / UPI access",
                "Contact bank security helpline",
            ],
        )

    # Priority 3: Financial Distress Check (THE ANTI-PREDATORY DEMO MONEY SHOT)
    if state == CustomerState.STRESSED:
        # If candidate action is attempting to sell a loan or credit product
        if candidate.is_commercial_loan or candidate.action == ActionType.RECOMMEND_PRODUCT:
            return GuardrailResult(
                action=ActionType.DEBT_SUPPORT_CALL,
                title="🤝 Financial Health Support & Relief",
                message="Saarthi noticed rising dues and cashflow strain. We have paused all loan offers and are here to help you regain financial stability.",
                guardrail_applied=True,
                blocked_action=f"Blocked Predatory Upsell: '{candidate.title}'",
                priority_rank=3,
                recommended_product=None,
                support_options=[
                    "Request a free confidential financial advisor callback",
                    "Explore EMI restructuring or moratorium options",
                    "Create an essential spending survival budget",
                ],
            )

    # Priority 4: Vulnerable State Guardrail (Caution on new obligations)
    if state == CustomerState.VULNERABLE:
        if candidate.is_commercial_loan:
            return GuardrailResult(
                action=ActionType.BUDGETING_ASSISTANCE,
                title="Budgeting & Obligation Review",
                message="Your debt obligations are approaching tight levels. We recommend building emergency savings before taking on new dues.",
                guardrail_applied=True,
                blocked_action=f"Blocked Loan Offer: '{candidate.title}' (Vulnerable Debt Buffer)",
                priority_rank=4,
                recommended_product=None,
                support_options=[
                    "Review upcoming bill calendar",
                    "Identify discretionary expense reductions",
                ],
            )

    # Normal Flow: Customer Benefit & Product Recommendations
    return GuardrailResult(
        action=candidate.action,
        title=candidate.title,
        message=candidate.message,
        guardrail_applied=False,
        blocked_action=None,
        priority_rank=6 if state == CustomerState.HEALTHY else 7,
        recommended_product=candidate.recommended_product,
        support_options=None,
    )
