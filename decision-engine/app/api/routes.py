import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.config import settings
from app.core.demo_personas import (
    get_fraud_priya,
    get_healthy_ramesh,
    get_stressed_ramesh,
)
from app.engine.pipeline import run_decision_engine
from app.schemas.models import (
    CustomerProfile,
    DecideRequest,
    DecideResponse,
    Transaction,
)

router = APIRouter()

# Demo personas registry for zero-dependency hackathon testing & demos
DEMO_PERSONAS = {
    "CUST_RAMESH_HEALTHY": get_healthy_ramesh,
    "CUST_RAMESH_STRESSED": get_stressed_ramesh,
    "CUST_PRIYA_FRAUD": get_fraud_priya,
}


@router.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "port": settings.PORT,
    }


@router.get("/personas", tags=["Demo Helpers"])
async def list_demo_personas():
    """Returns available pre-baked test personas for demoing."""
    return {
        "personas": [
            {
                "customer_id": "CUST_RAMESH_HEALTHY",
                "name": "Ramesh Patel (Healthy State)",
                "description": "Stable salary, positive savings, low EMI. Triggers investment/RD recommendation.",
            },
            {
                "customer_id": "CUST_RAMESH_STRESSED",
                "name": "Ramesh Patel (Stressed State)",
                "description": "High debt, missed EMI. Demonstrates anti-predatory guardrail blocking loan offers.",
            },
            {
                "customer_id": "CUST_PRIYA_FRAUD",
                "name": "Priya Sharma (Fraud Anomaly)",
                "description": "Normal transactions with sudden late-night outlier. Triggers fraud alert.",
            },
        ]
    }


@router.post("/decide", response_model=DecideResponse, tags=["Decision Engine"])
async def decide_next_best_action(request: DecideRequest):
    """
    Main Decision Endpoint:
    Evaluates customer profile & transaction history, computes financial signals,
    classifies state, runs the anti-predatory guardrail, and returns NextBestAction.

    Supports:
    1. Direct inline payload (customer + transactions)
    2. Built-in demo persona IDs ('CUST_RAMESH_HEALTHY', etc.)
    3. Remote fetching via Member 1 Data Service (${DATA_SERVICE_URL})
    """
    customer = request.customer
    transactions = request.transactions

    # Case 1: Pre-baked persona ID
    if (not customer or not transactions) and request.customer_id in DEMO_PERSONAS:
        customer, transactions = DEMO_PERSONAS[request.customer_id]()

    # Case 2: Fetch from Data Service canonical API (returns DE-compatible format)
    if not customer or transactions is None:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                cust_resp = await client.get(
                    f"{settings.DATA_SERVICE_URL}/api/v1/customers/{request.customer_id}"
                )
                if cust_resp.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Customer '{request.customer_id}' not found in Data Service ({settings.DATA_SERVICE_URL}).",
                    )
                cust_data = cust_resp.json()
                customer = CustomerProfile(**cust_data)

                txns_resp = await client.get(
                    f"{settings.DATA_SERVICE_URL}/api/v1/customers/{request.customer_id}/transactions"
                )
                if txns_resp.status_code == 200:
                    txns_data = txns_resp.json()
                    transactions = [Transaction(**t) for t in txns_data]
                else:
                    transactions = []
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Unable to reach Data Service at {settings.DATA_SERVICE_URL}: {str(exc)}. You can also provide 'customer' and 'transactions' directly in the request payload or use pre-baked demo IDs.",
            )

    # Run the six-step decision loop
    nba = run_decision_engine(customer, transactions)

    return DecideResponse(success=True, data=nba)


class EvaluateIntentRequest(BaseModel):
    customer_id: str
    proposed_action: str  # e.g. "loan_request", "balance_check"


class EvaluateIntentResponse(BaseModel):
    allowed: bool
    state: str
    reason: str
    support_options: list[str] | None = None


@router.post("/evaluate-intent", response_model=EvaluateIntentResponse, tags=["Decision Engine"])
async def evaluate_intent(request: EvaluateIntentRequest):
    """Lightweight guardrail check for chatbot: can this customer do this action?"""
    # Reuse the /decide logic to get customer state
    decide_req = DecideRequest(customer_id=request.customer_id)
    result = await decide_next_best_action(decide_req)
    nba = result.data

    loan_actions = {"loan_request", "apply_loan", "personal_loan", "home_loan"}
    is_loan = request.proposed_action in loan_actions

    if nba.state in ("stressed", "fraud_risk") and is_loan:
        return EvaluateIntentResponse(
            allowed=False,
            state=nba.state.value if hasattr(nba.state, 'value') else str(nba.state),
            reason=nba.plain_english_reason,
            support_options=nba.support_options,
        )

    return EvaluateIntentResponse(
        allowed=True,
        state=nba.state.value if hasattr(nba.state, 'value') else str(nba.state),
        reason="Action is permitted. Customer's financial health supports this.",
    )
