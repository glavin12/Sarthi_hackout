JOURNEY_DEFS = {
    "loan_request": {
        "journey": "loan",
        "steps": [
            ("understand_intent", "Confirm loan type and clarify what the customer needs"),
            ("check_eligibility_stress", "Review financial signals; explain eligibility in simple terms"),
            ("explain_options", "Present suitable loan options; explain EMI and interest simply"),
            ("documents", "List required documents and explain each"),
            ("kyc", "Walk through KYC process; what to submit"),
            ("apply", "Confirm readiness; describe next steps to apply"),
        ],
    },
    "kyc_help": {
        "journey": "kyc",
        "steps": [
            ("explain_kyc", "Explain what KYC is and why"),
            ("documents", "List documents needed"),
            ("submit", "Explain how to submit"),
        ],
    },
    "complaint": {
        "journey": "complaint",
        "steps": [
            ("acknowledge", "Acknowledge and reassure"),
            ("classify", "Classify the issue type"),
            ("resolve", "Escalate to human agent or offer resolution"),
        ],
    },
}

# ponytail: process-local dict, state resets on restart, swap to Redis if we scale
_STATE: dict[int, dict] = {}


def get_state(customer_id: int) -> dict | None:
    return _STATE.get(customer_id)


def reset(customer_id: int) -> None:
    _STATE.pop(customer_id, None)


def _build_state(intent: str, step: int) -> dict:
    defn = JOURNEY_DEFS[intent]
    topic, description = defn["steps"][step - 1]
    return {
        "journey": defn["journey"],
        "intent": intent,
        "step": step,
        "topic": topic,
        "description": description,
    }


def advance(customer_id: int, intent: str) -> dict | None:
    if intent not in JOURNEY_DEFS:
        reset(customer_id)
        return None

    current = _STATE.get(customer_id)
    if current is None or current["intent"] != intent:
        state = _build_state(intent, 1)
    else:
        next_step = current["step"] + 1
        if next_step > len(JOURNEY_DEFS[intent]["steps"]):
            reset(customer_id)
            return None
        state = _build_state(intent, next_step)

    _STATE[customer_id] = state
    return state
