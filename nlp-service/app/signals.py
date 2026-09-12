from collections import defaultdict

INCOME_TYPES = {"salary", "income"}
ESSENTIAL_TYPES = {"rent", "utilities", "groceries"}


def compute_signals(txns: list[dict]) -> dict:
    if not txns:
        return {
            "monthly_income": 0,
            "essential_spend": 0,
            "emi_burden": "low",
            "foir": 0.0,
            "missed_emi_count": 0,
            "anomaly_count": 0,
            "balance_trend": "stable",
            "is_stressed": False,
        }
    income_by_month = defaultdict(int)
    essential_by_month = defaultdict(int)
    emi_by_month = defaultdict(int)
    missed_emi_count = 0
    anomaly_count = 0
    for t in txns:
        month, ttype = t["date"][:7], t["type"]
        if ttype in INCOME_TYPES:
            income_by_month[month] += t["amount"]
        elif ttype in ESSENTIAL_TYPES:
            essential_by_month[month] += abs(t["amount"])
        elif ttype == "emi":
            emi_by_month[month] += abs(t["amount"])
        if ttype == "emi_missed":
            missed_emi_count += 1
        if t.get("is_anomaly") == 1:
            anomaly_count += 1

    n_months = len({t["date"][:7] for t in txns})
    monthly_income = round(sum(income_by_month.values()) / n_months)
    essential_spend = round(sum(essential_by_month.values()) / n_months)
    avg_emi = sum(emi_by_month.values()) / n_months
    foir = round(avg_emi / monthly_income, 3) if monthly_income else 0.0
    emi_burden = "high" if foir >= 0.5 else "moderate" if foir >= 0.3 else "low"

    balance_trend = "stable"
    sorted_txns = sorted(txns, key=lambda t: t["date"])
    if len(sorted_txns) >= 3:
        running, cum = [], 0
        for t in sorted_txns:
            cum += t["amount"]
            running.append(cum)
        third = len(running) // 3
        first_avg = sum(running[:third]) / third
        last_avg = sum(running[-third:]) / third
        pct = (last_avg - first_avg) / abs(first_avg) if first_avg else 0
        if pct > 0.1:
            balance_trend = "rising"
        elif pct < -0.1:
            balance_trend = "declining"
    is_stressed = missed_emi_count > 0 or emi_burden == "high" or balance_trend == "declining"
    return {
        "monthly_income": monthly_income,
        "essential_spend": essential_spend,
        "emi_burden": emi_burden,
        "foir": foir,
        "missed_emi_count": missed_emi_count,
        "anomaly_count": anomaly_count,
        "balance_trend": balance_trend,
        "is_stressed": is_stressed,
    }
