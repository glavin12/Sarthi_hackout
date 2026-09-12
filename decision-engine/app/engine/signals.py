from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Tuple
from app.schemas.models import CustomerProfile, FinancialSignals, Transaction


def compute_financial_signals(
    customer: CustomerProfile, transactions: List[Transaction]
) -> FinancialSignals:
    """
    Computes core financial signals from customer transactions matching the Saarthi spec:
    - Monthly Inflow (Income) & Regularity
    - Essential Spend (Rent, Groceries, Utilities)
    - Debt Obligations (EMI) and FOIR
    - Net Savings & Savings Rate
    - Balance Trend over time
    - Missed or Bounced EMI count
    """
    if not transactions:
        return FinancialSignals(
            monthly_income=customer.stated_monthly_income,
            essential_spend=0.0,
            savings_amount=customer.stated_monthly_income,
            savings_rate=1.0 if customer.stated_monthly_income > 0 else 0.0,
            monthly_emi=0.0,
            foir=0.0,
            income_regularity_score=0.5,
            balance_trend="stable",
            missed_emi_count=0,
            discretionary_spend_ratio=0.0,
        )

    # Sort chronologically
    txns = sorted(transactions, key=lambda t: t.timestamp)

    # Group transactions by calendar month (year, month)
    monthly_data: Dict[Tuple[int, int], Dict[str, float]] = defaultdict(
        lambda: {
            "income": 0.0,
            "essential": 0.0,
            "emi": 0.0,
            "discretionary": 0.0,
            "other_debit": 0.0,
        }
    )

    salary_days_of_month: List[int] = []
    missed_emi_count = 0

    for t in txns:
        ym = (t.timestamp.year, t.timestamp.month)

        if t.category == "EMI" and t.status in ("BOUNCED", "FAILED"):
            missed_emi_count += 1

        if t.type == "CREDIT" and t.status == "SUCCESS":
            if t.category == "SALARY":
                monthly_data[ym]["income"] += t.amount
                salary_days_of_month.append(t.timestamp.day)
            else:
                monthly_data[ym]["income"] += t.amount

        elif t.type == "DEBIT" and t.status == "SUCCESS":
            if t.category in ("RENT", "GROCERIES", "UTILITIES"):
                monthly_data[ym]["essential"] += t.amount
            elif t.category == "EMI":
                monthly_data[ym]["emi"] += t.amount
            elif t.category == "DISCRETIONARY":
                monthly_data[ym]["discretionary"] += t.amount
            else:
                monthly_data[ym]["other_debit"] += t.amount

    # Look at the most recent 1 to 3 distinct months
    sorted_months = sorted(monthly_data.keys())
    recent_months = sorted_months[-3:] if len(sorted_months) >= 3 else sorted_months

    if recent_months:
        avg_income = sum(monthly_data[m]["income"] for m in recent_months) / len(recent_months)
        avg_essential = sum(monthly_data[m]["essential"] for m in recent_months) / len(recent_months)
        avg_emi = sum(monthly_data[m]["emi"] for m in recent_months) / len(recent_months)
        avg_discretionary = sum(monthly_data[m]["discretionary"] for m in recent_months) / len(recent_months)
    else:
        avg_income = customer.stated_monthly_income
        avg_essential = 0.0
        avg_emi = 0.0
        avg_discretionary = 0.0

    # If no salary transactions were detected in recent months, fallback to stated income
    if avg_income <= 0.0:
        avg_income = customer.stated_monthly_income

    # FOIR calculation
    foir = (avg_emi / avg_income) if avg_income > 0 else 1.0

    # Net savings
    total_outflow = avg_essential + avg_emi + avg_discretionary
    savings_amount = max(0.0, avg_income - total_outflow)
    savings_rate = ((avg_income - total_outflow) / avg_income) if avg_income > 0 else 0.0
    discretionary_ratio = (avg_discretionary / avg_income) if avg_income > 0 else 0.0

    # Income regularity score (0.0 to 1.0)
    if len(salary_days_of_month) >= 2:
        mean_day = sum(salary_days_of_month) / len(salary_days_of_month)
        variance = sum((d - mean_day) ** 2 for d in salary_days_of_month) / len(salary_days_of_month)
        std_dev = variance ** 0.5
        income_regularity = max(0.3, min(1.0, 1.0 - (std_dev / 15.0)))
    else:
        income_regularity = 0.85

    # Balance Trend
    # Compare balance in first 20% of txns vs last 20% of txns
    split_idx = max(1, len(txns) // 5)
    initial_balances = [t.balance_after_txn for t in txns[:split_idx]]
    final_balances = [t.balance_after_txn for t in txns[-split_idx:]]

    avg_initial = sum(initial_balances) / len(initial_balances)
    avg_final = sum(final_balances) / len(final_balances)

    if avg_initial > 0:
        ratio = avg_final / avg_initial
        if ratio < 0.5:
            balance_trend = "sharp_decline"
        elif ratio < 0.85:
            balance_trend = "declining"
        elif ratio > 1.15:
            balance_trend = "rising"
        else:
            balance_trend = "stable"
    else:
        balance_trend = "declining" if avg_final <= 0 else "rising"

    return FinancialSignals(
        monthly_income=round(avg_income, 2),
        essential_spend=round(avg_essential, 2),
        savings_amount=round(savings_amount, 2),
        savings_rate=round(savings_rate, 4),
        monthly_emi=round(avg_emi, 2),
        foir=round(foir, 4),
        income_regularity_score=round(income_regularity, 2),
        balance_trend=balance_trend,
        missed_emi_count=missed_emi_count,
        discretionary_spend_ratio=round(discretionary_ratio, 4),
    )
