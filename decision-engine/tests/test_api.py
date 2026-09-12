import pytest
from fastapi.testclient import TestClient
from app.main import app
from tests.fixtures.personas import get_healthy_ramesh

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["port"] == 8001


def test_personas_catalog():
    response = client.get("/api/v1/personas")
    assert response.status_code == 200
    data = response.json()
    assert "personas" in data
    assert len(data["personas"]) >= 3


def test_decide_endpoint_with_demo_persona_id():
    response = client.post("/decide", json={"customer_id": "CUST_RAMESH_HEALTHY"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["state"] == "healthy"
    assert data["data"]["action"] == "recommend_product"


def test_decide_endpoint_with_stressed_persona_triggers_guardrail():
    response = client.post("/decide", json={"customer_id": "CUST_RAMESH_STRESSED"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["state"] == "stressed"
    assert data["data"]["guardrail_applied"] is True
    assert "Blocked Predatory Upsell" in data["data"]["blocked_action"]


def test_decide_endpoint_with_direct_payload():
    customer, txns = get_healthy_ramesh()
    payload = {
        "customer_id": customer.customer_id,
        "customer": customer.model_dump(mode="json"),
        "transactions": [t.model_dump(mode="json") for t in txns],
    }
    response = client.post("/decide", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["state"] == "healthy"
