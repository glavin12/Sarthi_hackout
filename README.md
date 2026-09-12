# SAARTHI

AI-powered personal banking layer. Multi-service demo. This repo currently
contains the **data-service** (member 3); other services + frontend land in
sibling directories.

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

### Run with Docker

```bash
docker compose up --build
```

Boots `data-service` on :8000. Other services are commented placeholders in
`docker-compose.yml` for teammates to fill in.

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
