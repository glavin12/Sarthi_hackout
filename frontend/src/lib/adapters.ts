/* ── Backend → frontend type adapters ──
 * decision-engine and nlp-service each use their own schema; these map them onto
 * the frontend's shared contracts in src/types.
 */
import { ActionType, BalancePoint, ChatResponse, CustomerState, NextBestAction, TransactionCategory } from "@/types";

const ACTION_MAP: Record<string, ActionType> = {
  recommend_product: "recommend",
  budgeting_assistance: "guide",
  debt_support_call: "support",
  fraud_alert_verify: "verify",
  do_nothing: "nothing",
};

// State → 0-100 health score band (decision-engine returns no numeric score).
const SCORE_BY_STATE: Record<string, number> = {
  healthy: 82,
  vulnerable: 55,
  stressed: 28,
  fraud_risk: 18,
};

function mapTrend(t: string): "rising" | "stable" | "falling" {
  if (t === "rising") return "rising";
  if (t === "declining" || t === "sharp_decline") return "falling";
  return "stable";
}

const EMPTY_MIX: Record<TransactionCategory, number> = {
  salary: 0, rent: 0, emi: 0, grocery: 0, upi: 0, utilities: 0,
  entertainment: 0, medical: 0, education: 0, transfer: 0, atm: 0, other: 0,
};

/** decision-engine NextBestAction.data → frontend CustomerState */
export function decisionToState(d: any): CustomerState {
  const s = d.signals;
  return {
    state: d.state,
    signals: {
      income_regularity: s.income_regularity_score,
      savings_rate: Math.round(s.savings_rate * 1000) / 10, // ratio → percentage
      foir: s.foir,
      balance_trend: mapTrend(s.balance_trend),
      spending_mix: EMPTY_MIX, // decision-engine doesn't return a category breakdown
      monthly_income: s.monthly_income,
      monthly_expenses: s.essential_spend + s.monthly_emi,
      monthly_savings: s.savings_amount,
      monthly_emis: s.monthly_emi,
      essential_spend: s.essential_spend,
    },
    why: d.plain_english_reason,
    score: SCORE_BY_STATE[d.state] ?? 50,
  };
}

/** decision-engine NextBestAction.data → frontend NextBestAction */
export function decisionToNba(d: any): NextBestAction {
  return {
    action: ACTION_MAP[d.action] ?? "nothing",
    payload: {
      title: d.title,
      description: d.message,
      cta_text: d.support_options?.length ? "Get support" : d.recommended_product ? "Learn more" : undefined,
      product: d.recommended_product ?? undefined,
    },
    reason: d.plain_english_reason,
    guardrail_passed: !d.guardrail_applied,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** canonical /api/v1 transactions (newest-first) → last-balance-per-month series */
export function txnsToBalanceHistory(txns: any[]): BalancePoint[] {
  const byMonth = new Map<string, { label: string; balance: number }>();
  for (const t of [...txns].reverse()) { // oldest-first so later writes win
    const d = new Date(t.timestamp);
    byMonth.set(`${d.getFullYear()}-${d.getMonth()}`, {
      label: MONTHS[d.getMonth()],
      balance: Math.round(t.balance_after_txn),
    });
  }
  return Array.from(byMonth.values()).slice(-9).map((m) => ({ month: m.label, balance: m.balance }));
}

/** nlp-service /chat → frontend ChatResponse (reply_text is what the UI renders) */
export function chatToResponse(r: any): ChatResponse {
  return {
    intent: r.intent,
    lang_detected: r.lang_detected,
    reply_text: r.reply_text,
    requires: r.requires ?? undefined,
    journey_step: undefined, // nlp returns an int step; frontend's JourneyStep is an object
  };
}
