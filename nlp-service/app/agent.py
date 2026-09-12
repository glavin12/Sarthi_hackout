"""Saarthi's LLM agent: Gemini tool-calling over the data-service helpers."""
import functools

from app.clients import get_customer, get_transactions
from app.signals import compute_signals
from app.journeys import get_state as journey_get_state, advance as journey_advance


SAARTHI_SYSTEM_PROMPT = """You are Saarthi, an AI banking assistant for Indian customers. Your job:
- Understand the customer's real financial situation from their data BEFORE giving advice.
- Reply in the CUSTOMER'S LANGUAGE: if lang is "hi", reply in Hindi (Devanagari script); if "gu", reply in Gujarati script; if "en", reply in English. Never mix scripts within one reply.
- Use SIMPLE language. If you use terms like FOIR, KYC, CIBIL, EMI, briefly explain them the first time.
- Be empathetic and warm. Especially when the customer is stressed.

CRITICAL RULE — STRESS PIVOT:
If the customer's intent is "loan_request", you MUST call `compute_financial_signals` first. If the returned `is_stressed` is true (missed EMIs, high EMI burden, or declining balance), DO NOT recommend a new loan. Instead, acknowledge the pressure with empathy, offer support (budgeting, restructuring existing dues, calling a human advisor), and explain WHY you are pausing the loan option. This is non-negotiable — customer wellbeing outranks conversion.

Available context (passed in the input):
- customer_id: <int>
- detected_language: <"en"|"hi"|"gu">
- classified_intent: <one of loan_request, balance_check, kyc_help, complaint, greeting, general>

Journey handling:
- If intent is one of loan_request / kyc_help / complaint, call `advance_journey(customer_id, intent)` to move the journey forward, then tailor your reply to that step's topic.
- If intent is greeting/general/balance_check, do NOT advance a journey.

Keep replies concise (2-4 short sentences). If listing steps, use short numbered lines.
"""


# --- tool functions (plain Python; wrapped into langchain Tools lazily in _get_executor) ---

def fetch_customer(customer_id: int) -> dict:
    """Fetch the customer's profile (name, language, KYC status, etc.) by customer_id."""
    return get_customer(customer_id)


def fetch_transactions(customer_id: int) -> list[dict]:
    """Fetch the customer's recent transactions, most recent first. Returns up to the last 30."""
    return get_transactions(customer_id)[:30]


def compute_financial_signals(customer_id: int) -> dict:
    """Compute financial health signals: monthly_income, essential_spend, emi_burden, foir,
    missed_emi_count, anomaly_count, balance_trend, is_stressed.
    ALWAYS call this before giving any loan advice, to check if the customer is financially stressed."""
    return compute_signals(get_transactions(customer_id))


def get_journey_state(customer_id: int) -> dict | None:
    """Get the customer's current multi-step journey state (loan/kyc/complaint), or None if no journey is active."""
    return journey_get_state(customer_id)


def advance_journey(customer_id: int, intent: str) -> dict | None:
    """Advance the customer's journey for the given intent (loan_request, kyc_help, or complaint)
    to its next step. Returns the new state (journey, step, topic, description), or None."""
    return journey_advance(customer_id, intent)


@functools.lru_cache(maxsize=1)
def _get_executor():
    import os
    from langchain_core.tools import StructuredTool
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.agents import create_tool_calling_agent, AgentExecutor
    from langchain_core.prompts import ChatPromptTemplate

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY must be set")

    llm = ChatGoogleGenerativeAI(
        model=os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite"),
        google_api_key=api_key,
        temperature=0.3,
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", SAARTHI_SYSTEM_PROMPT),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    tools = [
        StructuredTool.from_function(fetch_customer),
        StructuredTool.from_function(fetch_transactions),
        StructuredTool.from_function(compute_financial_signals),
        StructuredTool.from_function(get_journey_state),
        StructuredTool.from_function(advance_journey),
    ]
    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        return_intermediate_steps=True,
        max_iterations=5,
        verbose=False,
    )


def run_agent(text: str, customer_id: int, lang: str, intent: str) -> dict:
    executor = _get_executor()
    input_str = (
        f"customer_id={customer_id}\n"
        f"detected_language={lang}\n"
        f"classified_intent={intent}\n"
        f"customer_message: {text}"
    )
    result = executor.invoke({"input": input_str})
    reply = result.get("output", "")

    trace = []
    for action, obs in result.get("intermediate_steps", []):
        trace.append({
            "tool": getattr(action, "tool", str(action)),
            "input": getattr(action, "tool_input", None),
            "observation": str(obs)[:500],
        })

    state = journey_get_state(customer_id)
    journey_step = state["step"] if state else None
    requires = "human_callback" if state and state.get("topic") == "resolve" else None

    return {
        "reply_text": reply,
        "journey_step": journey_step,
        "requires": requires,
        "trace": trace,
    }
