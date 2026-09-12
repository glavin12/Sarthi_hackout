# Saarthi — Decision Engine (Service Brain)

**Service Port:** `8001`  
**Stack:** Python 3.11+ / FastAPI / Pydantic v2 / scikit-learn (`IsolationForest`) / pytest  
**Role:** Member 2 in the 4-person Saarthi Hackathon Team.

---

## What This Service Does
The Decision Engine is the central intelligence layer of Saarthi:
1. **Financial Signals**: Ingests 12–24 months of customer transactions and computes FOIR, savings rate, income regularity, and balance trends.
2. **ML Fraud Anomaly Detection**: Trains an `IsolationForest` on historical baseline spending to catch uncharacteristic high-value/late-night debits.
3. **State Classification**: Places the customer into one of 4 states:
   - 🟢 `healthy`
   - 🟡 `vulnerable`
   - 🔴 `stressed`
   - 🚨 `fraud_risk`
4. **Candidate NBA Selector**: Determines the optimal Next Best Action.
5. **Ethics & Anti-Predatory Guardrail (The Demo Money-Shot)**: Intercepts and **hard-blocks** loan upsells when a customer is `stressed`, overriding with debt relief & advisor callbacks.
6. **Plain-English Explainability**: Returns a human-friendly "Why" reason with factor traces.

---

## Quickstart

### 1. Activate Environment
```powershell
# Windows
.\.venv\Scripts\Activate.ps1
```

### 2. Run the Service
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
Interactive Swagger API documentation will be live at:
👉 **http://localhost:8001/docs**

### 3. Run the Automated Tests (TDD)
```bash
pytest -v
```

---

## Integration Contracts (For Teammates)

### `POST /decide` Request
```json
{
  "customer_id": "CUST_RAMESH_HEALTHY"
}
```
*Note:* You can pass just a demo ID (`CUST_RAMESH_HEALTHY`, `CUST_RAMESH_STRESSED`, `CUST_PRIYA_FRAUD`), or pass the full `customer` and `transactions` payload directly in the JSON!

### Sample Response (`NextBestAction`)
```json
{
  "success": true,
  "data": {
    "customer_id": "CUST_RAMESH_STRESSED",
    "customer_name": "Ramesh Patel",
    "state": "stressed",
    "action": "debt_support_call",
    "title": "🤝 Financial Health Support & Relief",
    "message": "Saarthi noticed rising dues and cashflow strain. We have paused all loan offers and are here to help you regain financial stability.",
    "plain_english_reason": "Saarthi noticed a missed or bounced EMI payment and over 60% of your monthly income going to existing loan dues. In accordance with our anti-predatory banking charter, we have blocked all new loan offers and activated debt restructuring support to protect your financial stability.",
    "guardrail_applied": true,
    "blocked_action": "Blocked Predatory Upsell: 'Pre-Approved Instant Personal Loan'",
    "priority_rank": 3,
    "recommended_product": null,
    "support_options": [
      "Request a free confidential financial advisor callback",
      "Explore EMI restructuring or moratorium options",
      "Create an essential spending survival budget"
    ],
    "signals": {
      "monthly_income": 42000.0,
      "essential_spend": 28500.0,
      "savings_amount": 0.0,
      "savings_rate": -0.15,
      "monthly_emi": 28000.0,
      "foir": 0.6667,
      "income_regularity_score": 0.95,
      "balance_trend": "sharp_decline",
      "missed_emi_count": 1,
      "discretionary_spend_ratio": 0.0,
      "is_fraud_anomaly_detected": false
    },
    "explainability_factors": [
      "1 missed/bounced EMI payment(s) detected.",
      "Severe debt burden: FOIR is 66.7% (threshold is 60%)."
    ]
  }
}
```
