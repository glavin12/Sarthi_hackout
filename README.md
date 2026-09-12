# SAARTHI

AI-powered personal banking layer. Multi-service demo with four wired services.

## Services

| Service | Port | Role |
|---|---|---|
| **data-service** | 8000 | SQLite source of truth: synthetic personas, transactions, demo levers |
| **decision-engine** | 8001 | The AI brain: signals → state → Next-Best-Action + anti-predatory guardrail |
| **nlp-service** | 8002 | Vernacular chat (Gemini); reads data-service |
| **frontend** | 3000 | Next.js adaptive dashboard + chat |

### How they connect

```
browser ── frontend :3000
   ├─ POST decision-engine :8001 /decide {customer_id}        → state + NBA
   ├─ POST data-service    :8000 /customers/{id}/inject-event → demo levers
   ├─ GET  data-service    :8000 /api/v1/customers/{id}/transactions → balance chart
   └─ POST nlp-service     :8002 /chat {customer_id,text,lang}

decision-engine ── GET data-service /api/v1/customers/{id}[/transactions]
nlp-service     ── GET data-service /customers/{id}[/transactions]
```

decision-engine consumes the **canonical `/api/v1`** shape; nlp-service consumes
the raw `/customers` shape. Backend→backend calls use docker service names;
the browser uses `localhost` (frontend `NEXT_PUBLIC_*`, baked at build time).

### Run the full stack

```bash
docker compose up --build
```

Boots all four services. Open the dashboard at http://localhost:3000/dashboard,
then use the **Demo Controls** (bottom-right) to inject events and watch the state
flip live. Set `GEMINI_API_KEY` in your environment for live chat (otherwise the
frontend falls back to canned replies).

To run a service directly, see its folder; each exposes `/docs`.

### Canonical `/api/v1` contract (what decision-engine consumes)

data-service maps its stored rows into this shape on the fly — no separate storage:

- **Customer**: `customer_id` (str), `name`, `consent_given`, `stated_monthly_income`, `account_created_at`
- **Transaction**: `txn_id`, `customer_id`, `timestamp` (ISO datetime), `amount` (≥0; direction in `type`), `type` (`CREDIT`/`DEBIT`), `category` (UPPERCASE: SALARY/EMI/RENT/GROCERIES/UTILITIES/TRANSFER/OTHER), `merchant`, `balance_after_txn`, `is_recurring`, `status` (`SUCCESS`/`BOUNCED`)

A `missed_emi` event surfaces as a `BOUNCED` `EMI` row; a `suspicious_debit` as a
large late-night (02:47) `DEBIT` — the signals decision-engine keys off.

## data-service (port 8000)

SQLite-backed store of 4 synthetic personas — `stable_salaried`, `gig_worker`,
`small_business`, `near_stress_family` — each with 18 months of realistic
transactions. Personas are generated once on startup if the DB is empty. It is
pure storage + a generator; it computes **no** financial state (downstream
services do that). Injected events just append distinctively-typed rows that flip
the demo.

**Amount convention:** signed integer rupees — credits `+`, debits `−`.

### Run locally

```bash
pip install -r data-service/requirements.txt
cd data-service && uvicorn app.main:app --port 8000
```

Open http://localhost:8000/docs for the interactive API.

### Seed / inspect the DB

The DB **auto-seeds on startup**, so `uvicorn ...` or `docker compose up` needs
nothing extra — the personas + 18 months of transactions are generated the first
time the service boots against an empty DB.

To fill (or verify) the DB **without** running the server:

```bash
cd data-service && python seed_db.py
```

The SQLite file is created at `data-service/data.db` (or wherever `DATA_DB_PATH`
points). Seeding is guarded on empty, so re-running is a no-op — to reseed from
scratch, delete `data.db` first.

### Endpoints (no auth)

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/customers` | list all personas |
| GET  | `/customers/{id}` | one persona |
| GET  | `/customers/{id}/transactions` | that persona's transactions, newest-first |
| POST | `/customers/{id}/inject-event` | fire a demo lever (body `{"event": "..."}`) |

### Demo levers (`inject-event`)

`event` is one of `missed_emi` | `income_drop` | `suspicious_debit` | `salary_hike`.
Each appends a current-dated row:

- `missed_emi` → `type=emi_missed`, amount 0 (skipped-payment marker)
- `income_drop` → a `salary` credit at ~50% of baseline
- `suspicious_debit` → a large negative `suspicious_debit` with `is_anomaly=1`
- `salary_hike` → a `salary` credit at ~130% of baseline

```bash
curl -X POST http://localhost:8000/customers/1/inject-event \
  -H "Content-Type: application/json" -d '{"event":"missed_emi"}'
```

### Reset

No reset endpoint — injected events persist. To reset to the clean generated
state, recreate the DB: delete `data-service/data.db` locally, or
`docker compose down && docker compose up --build`.

### Tests

```bash
cd data-service && pytest -q
```
