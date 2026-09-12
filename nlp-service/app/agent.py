"""Saarthi's LLM agent: Gemini via google-genai SDK.

Rewrite from the earlier langchain tool-calling implementation — the newer
Gemini 3.x models require thought_signature handling in tool-call responses,
which the pinned langchain-google-genai 2.x does not support. We inline the
customer's data into the prompt instead of exposing it as agent tools; the
model still gets everything it needs to give grounded advice, without the
tool-call round-trip that hits the version wall.

ponytail: inline context beats a tool-calling loop for a two-turn demo. If
the demo ever needs live multi-tool reasoning, swap to langchain 1.x /
langgraph's create_react_agent.
"""
from __future__ import annotations

import functools
import os

from app.clients import get_customer, get_transactions, get_decision
from app.journeys import get_state as journey_get_state, advance as journey_advance


SAARTHI_SYSTEM_PROMPT = """You are Saarthi, an AI banking assistant for Indian customers.

RULES:
- Reply in the CUSTOMER'S LANGUAGE. If lang=hi reply in Hindi (Devanagari). If lang=gu reply in Gujarati script. If lang=en reply in English. NEVER mix scripts in one reply.
- Use SIMPLE language. If you use terms like FOIR, KYC, CIBIL, EMI, briefly explain them the first time.
- Be empathetic and warm — especially when the customer is stressed.
- Keep replies concise (2-4 short sentences). If you list steps, use short numbered lines.
- If the question is unrelated to banking or personal finance, politely say you can't help with that and list what you CAN help with (loans, balance, KYC, savings goals, complaints).

STRESS PIVOT (non-negotiable):
If the customer_state is `stressed` or `fraud_risk`, DO NOT recommend new loans or upsell. Acknowledge the pressure with empathy, offer support (budgeting, restructuring existing dues, calling a human advisor), and explain WHY you are pausing the loan option.

You will be given the customer's real context. Ground your reply in it — don't invent numbers.
"""


def _build_context(customer_id: int, lang: str, intent: str, text: str) -> str:
    """Assemble the customer's real state into a single string the LLM
    reads. Everything the old tool-calling loop would have fetched is
    pulled up-front here."""
    parts: list[str] = [f"lang={lang}", f"classified_intent={intent}"]

    try:
        cust = get_customer(customer_id)
        parts.append(f"customer_name={cust.get('name')}")
        parts.append(f"monthly_income={cust.get('monthly_income')}")
    except Exception as e:
        parts.append(f"customer_fetch_error={e}")

    try:
        decision = get_decision(customer_id)
        data = decision.get("data", {})
        state = data.get("state", "unknown")
        parts.append(f"customer_state={state}")
        parts.append(f"is_stressed={state in ('stressed', 'fraud_risk')}")
        signals = data.get("signals", {})
        for k in ("monthly_income", "essential_spend", "monthly_emi",
                 "savings_amount", "savings_rate", "foir", "balance_trend"):
            if k in signals:
                parts.append(f"{k}={signals[k]}")
        if data.get("plain_english_reason"):
            parts.append(f"why={data['plain_english_reason']}")
    except Exception as e:
        parts.append(f"decision_fetch_error={e}")

    state = journey_get_state(customer_id)
    if state:
        parts.append(f"journey_step={state.get('step')}")
        parts.append(f"journey_topic={state.get('topic')}")

    parts.append(f"customer_message={text}")
    return "\n".join(parts)


@functools.lru_cache(maxsize=1)
def _client():
    from google import genai
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY must be set")
    return genai.Client(api_key=api_key)


def _generate(prompt: str, model: str) -> str:
    from google.genai import types
    client = _client()
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SAARTHI_SYSTEM_PROMPT,
            temperature=0.3,
            max_output_tokens=512,
        ),
    )
    # `.text` collapses candidates → single string; empty string if the model
    # refused / safety-blocked.
    return (resp.text or "").strip()


def run_agent(text: str, customer_id: int, lang: str, intent: str) -> dict:
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    context = _build_context(customer_id, lang, intent, text)

    # Advance the journey for loan/kyc/complaint intents so the UI's stepper
    # keeps moving. Greetings and general questions don't move a journey.
    if intent in ("loan_request", "kyc_help", "complaint"):
        journey_advance(customer_id, intent)

    try:
        reply = _generate(context, model_name)
    except Exception as e:
        # If the LLM is unavailable, return a polite fallback in the user's
        # language. The frontend also has its own mock — this is the second
        # line of defense.
        reply = _fallback_reply(lang, e)

    if not reply:
        reply = _fallback_reply(lang, "empty response")

    state = journey_get_state(customer_id)
    return {
        "reply_text": reply,
        "journey_step": state["step"] if state else None,
        "requires": "human_callback" if state and state.get("topic") == "resolve" else None,
        "trace": [],
    }


def _fallback_reply(lang: str, err) -> str:
    # Keep this in sync with the frontend's `unknown_*` copy.
    if lang == "hi":
        return "माफ़ कीजिए, मैं अभी जवाब नहीं दे पा रहा। कृपया थोड़ी देर में फिर से पूछें।"
    if lang == "gu":
        return "માફ કરશો, હું અત્યારે જવાબ આપી શકતો નથી. કૃપા કરી થોડી વારમાં ફરી પૂછો."
    return "Sorry, I couldn't process that right now. Please try again in a moment."
