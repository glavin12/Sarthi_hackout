import os
import httpx

DATA_SERVICE_URL = os.environ.get("DATA_SERVICE_URL", "http://localhost:8000")
DECISION_ENGINE_URL = os.environ.get("DECISION_ENGINE_URL", "http://localhost:8001")


def get_customer(customer_id: int) -> dict:
    resp = httpx.get(f"{DATA_SERVICE_URL}/customers/{customer_id}", timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_transactions(customer_id: int) -> list[dict]:
    resp = httpx.get(f"{DATA_SERVICE_URL}/customers/{customer_id}/transactions", timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_decision(customer_id: int) -> dict:
    """Call Decision Engine to get the canonical customer state and Next Best Action."""
    resp = httpx.post(
        f"{DECISION_ENGINE_URL}/api/v1/decide",
        json={"customer_id": str(customer_id)},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def evaluate_intent(customer_id: int, proposed_action: str) -> dict:
    """Check with Decision Engine if a proposed action is allowed for this customer."""
    resp = httpx.post(
        f"{DECISION_ENGINE_URL}/api/v1/evaluate-intent",
        json={"customer_id": str(customer_id), "proposed_action": proposed_action},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
