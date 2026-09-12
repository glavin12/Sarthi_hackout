import os
import httpx

DATA_SERVICE_URL = os.environ.get("DATA_SERVICE_URL", "http://localhost:8000")


def get_customer(customer_id: int) -> dict:
    resp = httpx.get(f"{DATA_SERVICE_URL}/customers/{customer_id}", timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_transactions(customer_id: int) -> list[dict]:
    resp = httpx.get(f"{DATA_SERVICE_URL}/customers/{customer_id}/transactions", timeout=10)
    resp.raise_for_status()
    return resp.json()
