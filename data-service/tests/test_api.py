"""End-to-end checks against a temp DB. Sets DATA_DB_PATH before importing app so
seeding runs against a throwaway file."""
import importlib
import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DB_PATH", str(tmp_path / "test.db"))
    import app.main as main
    importlib.reload(main)  # re-bind DB_PATH to the temp path
    with TestClient(main.app) as c:  # triggers lifespan -> seeding
        yield c


def test_seeds_four_personas(client):
    r = client.get("/customers")
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 4
    assert {c["persona_type"] for c in body} == {
        "stable_salaried", "gig_worker", "small_business", "near_stress_family"}


def test_customer_404(client):
    assert client.get("/customers/999").status_code == 404
    assert client.get("/customers/999/transactions").status_code == 404


def test_transactions_shape(client):
    txns = client.get("/customers/1/transactions").json()
    assert len(txns) > 50  # 18 months of activity
    dates = [t["date"] for t in txns]
    assert dates == sorted(dates, reverse=True)  # newest-first
    assert any(t["amount"] > 0 for t in txns)  # credits
    assert any(t["amount"] < 0 for t in txns)  # debits


@pytest.mark.parametrize("event,expected_type", [
    ("missed_emi", "emi_missed"),
    ("income_drop", "salary"),
    ("suspicious_debit", "suspicious_debit"),
    ("salary_hike", "salary"),
])
def test_inject_event_adds_row(client, event, expected_type):
    before = len(client.get("/customers/1/transactions").json())
    r = client.post("/customers/1/inject-event", json={"event": event})
    assert r.status_code == 200
    added = r.json()
    assert added and added[0]["type"] == expected_type
    after = client.get("/customers/1/transactions").json()
    assert len(after) == before + 1
    assert after[0]["id"] == added[0]["id"]  # newest-first -> injected row on top


def test_suspicious_debit_flagged(client):
    added = client.post("/customers/1/inject-event",
                        json={"event": "suspicious_debit"}).json()
    assert added[0]["is_anomaly"] == 1
    assert added[0]["amount"] < 0


def test_bad_event_422(client):
    assert client.post("/customers/1/inject-event",
                       json={"event": "nope"}).status_code == 422


def test_inject_missing_customer_404(client):
    assert client.post("/customers/999/inject-event",
                       json={"event": "missed_emi"}).status_code == 404
