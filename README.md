# Saarthi

**AI-Powered Hyper-Personalized Banking for Bharat.**

A conversational, multilingual banking co-pilot that reads a customer's real financial life, decides responsibly, and protects the borrower — not just the balance sheet.

> Built by **Team AlphaQ**

---

## Why Saarthi

Most digital lending apps in India ship one product, one language, and zero awareness of the borrower's actual financial state. Saarthi flips that:

- **Understand** — reads 18 months of real transaction data.
- **Decide** — classifies the customer as *healthy · vulnerable · stressed · fraud-risk* and picks the next best action.
- **Assist** — chats and speaks in English, Hindi, and Gujarati, grounded in the customer's own numbers.
- **Protect** — automatic guardrails pause new lending and offer restructuring when the customer is under pressure.

---

## Architecture

Four small services. Each does one thing.

```
                   ┌─────────────────────────────────────┐
                   │       Next.js 14  Frontend          │
                   │   Dashboard · Chat · Loans · Goals  │
                   │       :3000                         │
                   └───────────────┬─────────────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
    ┌──────────────┐      ┌────────────────┐    ┌────────────────┐
    │ data-service │      │ decision-engine│    │   nlp-service  │
    │   FastAPI    │◄─────│    FastAPI     │    │     FastAPI    │
    │   SQLite     │      │  scikit-learn  │    │  google-genai  │
    │    :8000     │      │      :8001     │    │      :8002     │
    └──────────────┘      └────────────────┘    └───────┬────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │ Gemini 3.1   │
                                                 │  Google AI   │
                                                 └──────────────┘
```

| Service | Port | Responsibility |
|---|---|---|
| **data-service** | `8000` | SQLite source of truth. Personas, 18-month transaction history, auth (PBKDF2), demo event injector, canonical `/api/v1` shape. |
| **decision-engine** | `8001` | Turns raw signals into a customer state (`healthy` / `vulnerable` / `stressed` / `fraud_risk`) and a Next-Best-Action with a guardrail flag. |
| **nlp-service** | `8002` | Gemini-backed multilingual chat. Grounds every reply in the customer's real signals and current journey step. |
| **frontend** | `3000` | Next.js 14, Tailwind, Framer Motion. Adaptive dashboard, guided loan journey, voice-enabled chat. |

---

## Features

### Auth & session
- `/auth/register` and `/auth/login` on data-service (PBKDF2 hashing, unique-email + regex validation).
- 4 seeded accounts + open sign-up.
- Session stored client-side; every backend call carries the logged-in `customer_id`.

### Adaptive dashboard
- Live financial health score (0-100) that shifts with the customer's state.
- Metric cards for income, essentials, savings, EMIs — real numbers from the decision engine.
- Applied loans appear as an "Active loans" card and adjust the EMI + savings figures.
- New-user onboarding: no fabricated metrics — a genuine empty state with three starter actions.

### Multilingual voice chat
- **Text + voice** in English (`en-IN`), Hindi (`hi-IN`), Gujarati (`gu-IN`).
- Voice input via the browser's Web Speech API — no cloud STT dependency, no npm package.
- Auto-detects the script of the user's message and replies in the same language.
- Polite "I don't know" fallback in the user's language when the query is off-topic.
- Fresh chat on language switch (no mixed-script transcripts).

### Guided loan journey
- 6 steps: intent → info → eligibility → options → documents → apply.
- Real document upload from device via `<input type="file">`.
- On submit, the loan is persisted per user; the dashboard reflects the new EMI immediately.

### Goals
- Savings-goal tracker with progress bars, contributions, and per-user persistence.

### Settings
- Editable display name, notification toggles, prominent sign-out card, local-data wipe.

---

## Quick start

### Prerequisites
- **Python** 3.11+
- **Node.js** 20+
- **npm** 10+
- **Gemini API key** (get one at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Clone

```bash
git clone https://github.com/glavin12/Sarthi_hackout.git
cd Sarthi_hackout
```

### 2. Gemini key

```bash
cp nlp-service/.env.example nlp-service/.env
# edit nlp-service/.env and paste your GEMINI_API_KEY
```

### 3. Install & run each service

Open four terminals.

```bash
# terminal 1 — data-service
pip install -r data-service/requirements.txt
cd data-service && python -m uvicorn app.main:app --port 8000
```

```bash
# terminal 2 — decision-engine
pip install -r decision-engine/requirements.txt
cd decision-engine && python -m uvicorn app.main:app --port 8001
```

```bash
# terminal 3 — nlp-service
pip install -r nlp-service/requirements.txt
cd nlp-service && python -m uvicorn app.main:app --port 8002
```

```bash
# terminal 4 — frontend
cd frontend && npm install && npm run dev
```

### 4. Open

Visit **http://localhost:3000** and either sign in as a seeded account or create a new one.

### One-shot: Docker

```bash
docker compose up --build
```

(Set `GEMINI_API_KEY` in your shell first.)

---

## Demo accounts

| Email | Password | Persona |
|---|---|---|
| `ramesh@saarthi.in` | `ramesh@123` | Stable Salaried |
| `priya@saarthi.in`  | `priya@123`  | Gig Worker |
| `amit@saarthi.in`   | `amit@123`   | Small Business |
| `sunita@saarthi.in` | `sunita@123` | Near-stress Family |

New accounts start with an honest empty dashboard until they add data.

---

## Demo script (≈ 2 minutes)

1. **Sign in** as `ramesh@saarthi.in` — dashboard loads with real 18-month signals.
2. Open **/chat**, switch to **हिं**, and ask *"मुझे होम लोन की जानकारी चाहिए"*. Gemini replies in Hindi, grounded in Ramesh's actual numbers.
3. Tap the **mic**, speak in Hindi or Gujarati — the transcript lands in the input.
4. Trigger a stress state (e.g. missed EMI via `/customers/1/inject-event`). Ask for a loan again — **Saarthi refuses** and offers restructuring instead.
5. Walk the **loan journey** to submission — the new EMI shows up on the dashboard the next second.

---

## Repository layout

```
Sarthi_hackout/
├── data-service/          # FastAPI · SQLite · auth · personas
│   ├── app/
│   │   ├── main.py        # endpoints
│   │   └── seed.py        # persona + transaction generator
│   └── tests/
├── decision-engine/       # FastAPI · scikit-learn · rules
│   ├── app/
│   │   ├── main.py
│   │   ├── engine/        # signals → state → NBA
│   │   └── adapters.py
│   └── tests/
├── nlp-service/           # FastAPI · google-genai · Gemini
│   ├── app/
│   │   ├── agent.py       # grounded prompt + reply
│   │   ├── intents.py     # multilingual intent classifier
│   │   ├── journeys.py
│   │   └── main.py
│   └── tests/
├── frontend/              # Next.js 14 · Tailwind · Framer Motion
│   └── src/
│       ├── app/           # /welcome /dashboard /chat /loan-journey /goals /settings
│       ├── components/
│       ├── lib/           # api · auth · speech · loans · goals · prefs
│       └── mocks/
└── docker-compose.yml
```

---

## Tech stack

**Backend:** FastAPI · SQLite · scikit-learn · google-genai · sentence-transformers
**Frontend:** Next.js 14 · React 18 · TypeScript · Tailwind CSS · Framer Motion · Recharts
**AI:** Gemini 3.1 (Google) · Web Speech API (browser-native voice I/O)
**Auth:** PBKDF2-HMAC-SHA256 (100k iterations)

---

## Testing

```bash
# data-service
cd data-service && pytest -q         # 16 tests

# decision-engine
cd decision-engine && pytest -q

# frontend type-check
cd frontend && npx tsc --noEmit
```

---

## Environment variables

| Var | Service | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | nlp-service | Required for live chat. |
| `GEMINI_MODEL` | nlp-service | Model id (default `gemini-2.5-flash`). |
| `DATA_SERVICE_URL` | nlp-service, decision-engine | Backend-to-backend URL (default `http://localhost:8000`). |
| `DECISION_ENGINE_URL` | nlp-service | Default `http://localhost:8001`. |
| `NEXT_PUBLIC_DATA_SERVICE_URL` | frontend | Baked at build time (default `http://localhost:8000`). |
| `NEXT_PUBLIC_DECISION_ENGINE_URL` | frontend | Default `http://localhost:8001`. |
| `NEXT_PUBLIC_NLP_URL` | frontend | Default `http://localhost:8002`. |
| `DATA_DB_PATH` | data-service | SQLite file (default `data.db`). |

---

## Team

**Team AlphaQ** — *Digital Transformation in Lending*

---

## License

Educational / hackathon use. See individual service directories for any additional notes.
