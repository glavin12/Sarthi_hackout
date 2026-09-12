"""Saarthi NLP service tests. Single file, monkeypatch only, no live Gemini/data-service calls."""
import os
import pytest
from fastapi.testclient import TestClient


# --- 1. Language detection ---

def test_detect_lang_english():
    from app.main import detect_lang
    assert detect_lang("How do I apply for a loan?", "en") == "en"


def test_detect_lang_hindi():
    from app.main import detect_lang
    assert detect_lang("मुझे लोन चाहिए", "en") == "hi"


def test_detect_lang_gujarati():
    from app.main import detect_lang
    assert detect_lang("મારે લોન જોઈએ છે", "en") == "gu"


# --- 2. Intent classification ---
# First call downloads the sentence-transformers model (30-60s). Expected — do not skip.

def test_intent_loan_english():
    from app.intents import classify
    intent, _ = classify("I need a personal loan")
    assert intent == "loan_request"


def test_intent_greeting_english():
    from app.intents import classify
    intent, _ = classify("hello there")
    assert intent == "greeting"


def test_intent_kyc_english():
    from app.intents import classify
    intent, _ = classify("how do I complete my KYC?")
    assert intent == "kyc_help"


def test_intent_loan_hindi():
    from app.intents import classify
    intent, _ = classify("मुझे होम लोन चाहिए")
    assert intent == "loan_request"


def test_intent_loan_gujarati():
    from app.intents import classify
    intent, _ = classify("મારે લોન જોઈએ છે")
    assert intent == "loan_request"


# --- 3. Journey state machine ---

def test_journey_loan_progression():
    from app.journeys import advance, reset
    reset(999)
    for expected_step in range(1, 7):
        state = advance(999, "loan_request")
        assert state["step"] == expected_step
    assert advance(999, "loan_request") is None


def test_journey_different_intent_resets():
    from app.journeys import advance, reset
    reset(999)
    advance(999, "loan_request")
    advance(999, "loan_request")
    state = advance(999, "kyc_help")
    assert state["journey"] == "kyc"
    assert state["step"] == 1


def test_journey_non_journey_intent_resets():
    from app.journeys import advance, reset, get_state
    reset(999)
    advance(999, "loan_request")
    assert advance(999, "greeting") is None
    assert get_state(999) is None


# --- 4. Signals / stress-pivot ---

def test_signals_healthy_customer():
    from app.signals import compute_signals
    txns = [
        {"id": 1, "customer_id": 1, "date": "2026-07-01", "amount": 42000, "type": "salary", "description": "Salary credit", "is_anomaly": 0},
        {"id": 2, "customer_id": 1, "date": "2026-07-02", "amount": -12000, "type": "rent", "description": "Rent", "is_anomaly": 0},
        {"id": 3, "customer_id": 1, "date": "2026-07-03", "amount": -2000, "type": "utilities", "description": "Electricity + water", "is_anomaly": 0},
        {"id": 4, "customer_id": 1, "date": "2026-07-04", "amount": -3000, "type": "groceries", "description": "Groceries", "is_anomaly": 0},
        {"id": 5, "customer_id": 1, "date": "2026-07-05", "amount": -1000, "type": "emi", "description": "Small EMI", "is_anomaly": 0},
        {"id": 6, "customer_id": 1, "date": "2026-08-01", "amount": 42000, "type": "salary", "description": "Salary credit", "is_anomaly": 0},
        {"id": 7, "customer_id": 1, "date": "2026-08-02", "amount": -12000, "type": "rent", "description": "Rent", "is_anomaly": 0},
        {"id": 8, "customer_id": 1, "date": "2026-08-03", "amount": -2000, "type": "utilities", "description": "Electricity + water", "is_anomaly": 0},
        {"id": 9, "customer_id": 1, "date": "2026-08-04", "amount": -3000, "type": "groceries", "description": "Groceries", "is_anomaly": 0},
        {"id": 10, "customer_id": 1, "date": "2026-08-05", "amount": -1000, "type": "emi", "description": "Small EMI", "is_anomaly": 0},
    ]
    signals = compute_signals(txns)
    assert signals["is_stressed"] is False
    assert signals["emi_burden"] in ("low", "moderate")
    assert signals["missed_emi_count"] == 0


def test_signals_stressed_customer_missed_emi():
    from app.signals import compute_signals
    txns = [
        {"id": 1, "customer_id": 2, "date": "2026-07-01", "amount": 30000, "type": "salary", "description": "Salary credit", "is_anomaly": 0},
        {"id": 2, "customer_id": 2, "date": "2026-07-02", "amount": -10000, "type": "rent", "description": "Rent", "is_anomaly": 0},
        {"id": 3, "customer_id": 2, "date": "2026-07-03", "amount": -16000, "type": "emi", "description": "Big EMI", "is_anomaly": 0},
        {"id": 4, "customer_id": 2, "date": "2026-07-15", "amount": -16000, "type": "emi_missed", "description": "Missed EMI", "is_anomaly": 0},
        {"id": 5, "customer_id": 2, "date": "2026-08-01", "amount": 30000, "type": "salary", "description": "Salary credit", "is_anomaly": 0},
        {"id": 6, "customer_id": 2, "date": "2026-08-02", "amount": -10000, "type": "rent", "description": "Rent", "is_anomaly": 0},
        {"id": 7, "customer_id": 2, "date": "2026-08-03", "amount": -16000, "type": "emi", "description": "Big EMI", "is_anomaly": 0},
        {"id": 8, "customer_id": 2, "date": "2026-08-15", "amount": -16000, "type": "emi_missed", "description": "Missed EMI", "is_anomaly": 0},
    ]
    signals = compute_signals(txns)
    assert signals["is_stressed"] is True
    assert signals["missed_emi_count"] >= 1


# --- 5. /chat endpoint ---

def _fake_run_agent(text, customer_id, lang, intent):
    return {"reply_text": f"[stub reply lang={lang} intent={intent}]",
            "journey_step": 1 if intent in ("loan_request", "kyc_help", "complaint") else None,
            "requires": None, "trace": []}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr("app.main.run_agent", _fake_run_agent)
    from app.main import app
    return TestClient(app)


def test_chat_response_shape(client):
    resp = client.post("/chat", json={"customer_id": 1, "text": "hello", "lang": "en"})
    assert resp.status_code == 200
    body = resp.json()
    for key in ("intent", "lang_detected", "reply_text", "journey_step", "requires"):
        assert key in body
    assert body["lang_detected"] == "en"
    assert body["intent"] == "greeting"


def test_chat_hindi_lang_detected(client):
    resp = client.post("/chat", json={"customer_id": 1, "text": "नमस्ते", "lang": "en"})
    assert resp.status_code == 200
    assert resp.json()["lang_detected"] == "hi"


def test_chat_gujarati_lang_detected(client):
    resp = client.post("/chat", json={"customer_id": 1, "text": "કેમ છો", "lang": "en"})
    assert resp.status_code == 200
    assert resp.json()["lang_detected"] == "gu"


# --- 6. Skippable Gemini live test ---

@pytest.mark.skipif(
    not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")),
    reason="GEMINI_API_KEY not set — live Gemini test skipped",
)
def test_agent_live_greeting(monkeypatch):
    """Live sanity check: greeting yields a non-empty reply. Skips when no API key."""
    from app.agent import run_agent
    result = run_agent("hello Saarthi", customer_id=1, lang="en", intent="greeting")
    assert isinstance(result.get("reply_text"), str) and result["reply_text"].strip()
