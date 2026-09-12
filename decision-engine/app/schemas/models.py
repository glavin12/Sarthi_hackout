from datetime import datetime
from enum import Enum
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class CustomerState(str, Enum):
    HEALTHY = "healthy"
    VULNERABLE = "vulnerable"
    STRESSED = "stressed"
    FRAUD_RISK = "fraud_risk"


class ActionType(str, Enum):
    RECOMMEND_PRODUCT = "recommend_product"
    BUDGETING_ASSISTANCE = "budgeting_assistance"
    DEBT_SUPPORT_CALL = "debt_support_call"
    FRAUD_ALERT_VERIFY = "fraud_alert_verify"
    DO_NOTHING = "do_nothing"


class Transaction(BaseModel):
    txn_id: str
    customer_id: str
    timestamp: datetime
    amount: float = Field(..., ge=0.0, description="Transaction amount in INR")
    type: Literal["CREDIT", "DEBIT"]
    category: Literal[
        "SALARY",
        "EMI",
        "RENT",
        "GROCERIES",
        "UTILITIES",
        "DISCRETIONARY",
        "INVESTMENT",
        "TRANSFER",
        "OTHER",
    ] = "OTHER"
    merchant: Optional[str] = None
    balance_after_txn: float = 0.0
    is_recurring: bool = False
    status: Literal["SUCCESS", "FAILED", "BOUNCED"] = "SUCCESS"


class CustomerProfile(BaseModel):
    customer_id: str
    name: str
    consent_given: bool = True
    stated_monthly_income: float = Field(..., ge=0.0)
    account_created_at: Optional[datetime] = None


class FinancialSignals(BaseModel):
    monthly_income: float
    essential_spend: float
    savings_amount: float
    savings_rate: float
    monthly_emi: float
    foir: float  # Fixed Obligation to Income Ratio
    income_regularity_score: float  # 0.0 - 1.0
    balance_trend: Literal["rising", "stable", "declining", "sharp_decline"]
    missed_emi_count: int
    discretionary_spend_ratio: float
    is_fraud_anomaly_detected: bool = False
    anomaly_score: Optional[float] = None
    flagged_txn_id: Optional[str] = None


class NextBestAction(BaseModel):
    customer_id: str
    customer_name: str
    state: CustomerState
    action: ActionType
    title: str
    message: str
    plain_english_reason: str
    guardrail_applied: bool
    blocked_action: Optional[str] = None
    priority_rank: int
    recommended_product: Optional[str] = None
    support_options: Optional[List[str]] = None
    signals: FinancialSignals
    explainability_factors: List[str]


class DecideRequest(BaseModel):
    customer_id: str
    customer: Optional[CustomerProfile] = None
    transactions: Optional[List[Transaction]] = None


class DecideResponse(BaseModel):
    success: bool = True
    data: NextBestAction
