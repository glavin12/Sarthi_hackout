/* ── Saarthi Types — Shared Contracts ── */

/** Customer profile */
export interface Customer {
  id: string;
  name: string;
  language: "en" | "hi" | "gu";
  kyc: "complete" | "pending" | "partial";
  avatar?: string;
}

/** Single transaction record */
export interface Transaction {
  id: string;
  customer_id: string;
  amount: number;
  timestamp: string;
  category: TransactionCategory;
  merchant: string;
  type: "credit" | "debit";
}

export type TransactionCategory =
  | "salary"
  | "rent"
  | "emi"
  | "grocery"
  | "upi"
  | "utilities"
  | "entertainment"
  | "medical"
  | "education"
  | "transfer"
  | "atm"
  | "other";

/** Financial state classification */
export type CustomerStateType = "healthy" | "vulnerable" | "stressed" | "fraud_risk";

/** Financial signals derived from transactions */
export interface FinancialSignals {
  income_regularity: number;       // 0-1 score
  savings_rate: number;            // percentage
  foir: number;                    // Fixed Obligations to Income Ratio
  balance_trend: "rising" | "stable" | "falling";
  spending_mix: Record<TransactionCategory, number>;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  monthly_emis: number;
  essential_spend: number;
}

/** Customer state with signals */
export interface CustomerState {
  state: CustomerStateType;
  signals: FinancialSignals;
  why: string;
  score: number;                   // 0-100 health score
}

/** Next Best Action from the decision engine */
export type ActionType = "recommend" | "guide" | "support" | "warn" | "verify" | "nothing";

export interface NextBestAction {
  action: ActionType;
  payload: {
    title: string;
    description: string;
    cta_text?: string;
    cta_link?: string;
    product?: string;
  };
  reason: string;
  guardrail_passed: boolean;
}

/** Chat message */
export interface ChatMessage {
  id: string;
  role: "user" | "saarthi";
  text: string;
  lang: "en" | "hi" | "gu";
  timestamp: string;
  journey_step?: JourneyStep;
}

/** Guided journey step */
export interface JourneyStep {
  step: number;
  total: number;
  label: string;
  status: "completed" | "active" | "pending";
}

/** Chat response from NLP service */
export interface ChatResponse {
  intent: "loan_request" | "balance_check" | "kyc_help" | "complaint" | "greeting";
  lang_detected: "en" | "hi" | "gu";
  reply_text: string;
  journey_step?: JourneyStep;
  requires?: string;
}

/** Injectable demo events */
export type DemoEvent = "missed_emi" | "income_drop" | "suspicious_debit" | "salary_hike";

/** Balance history point for charts */
export interface BalancePoint {
  month: string;
  balance: number;
}
