"""Saarthi NLP service — vernacular banking chatbot on port 8002."""
from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()  # must run before any module reads env vars

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.intents import classify
from app.agent import run_agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("saarthi-nlp")

app = FastAPI(title="Saarthi NLP Service", version="1.0.0")

# Browser (frontend) calls /chat directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    customer_id: int
    text: str
    lang: str


class ChatResponse(BaseModel):
    intent: str
    lang_detected: str
    reply_text: str
    journey_step: int | None
    requires: str | None


def detect_lang(text: str, fallback: str) -> str:
    if not text.strip():
        return fallback or "en"
    if any(0x0900 <= ord(c) <= 0x097F for c in text):
        return "hi"
    if any(0x0A80 <= ord(c) <= 0x0AFF for c in text):
        return "gu"
    return "en"


@app.get("/health")
def health():
    return {"status": "ok", "service": "nlp-service"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    lang_detected = detect_lang(req.text, req.lang)
    intent, score = classify(req.text)
    logger.info(
        "intent=%s score=%.3f lang=%s customer=%d",
        intent, score, lang_detected, req.customer_id,
    )
    result = run_agent(
        text=req.text,
        customer_id=req.customer_id,
        lang=lang_detected,
        intent=intent,
    )
    return ChatResponse(
        intent=intent,
        lang_detected=lang_detected,
        reply_text=result["reply_text"],
        journey_step=result.get("journey_step"),
        requires=result.get("requires"),
    )
