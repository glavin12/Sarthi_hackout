import {
  Customer,
  Transaction,
  CustomerState,
  NextBestAction,
  BalancePoint,
  ChatResponse,
  CustomerStateType,
  DemoEvent,
} from "@/types";

/* ── Persona: Ramesh Kumar ── */
export const mockCustomer: Customer = {
  id: "cust_001",
  name: "Ramesh Kumar",
  language: "en",
  kyc: "complete",
};

/* ── Transactions (18 months) ── */
export const mockTransactions: Transaction[] = [
  { id: "t1", customer_id: "cust_001", amount: 42000, timestamp: "2025-07-01", category: "salary", merchant: "Infosys Ltd", type: "credit" },
  { id: "t2", customer_id: "cust_001", amount: 12000, timestamp: "2025-07-02", category: "rent", merchant: "Landlord", type: "debit" },
  { id: "t3", customer_id: "cust_001", amount: 6500, timestamp: "2025-07-05", category: "emi", merchant: "HDFC Home Loan", type: "debit" },
  { id: "t4", customer_id: "cust_001", amount: 3200, timestamp: "2025-07-08", category: "grocery", merchant: "BigBasket", type: "debit" },
  { id: "t5", customer_id: "cust_001", amount: 1500, timestamp: "2025-07-10", category: "utilities", merchant: "BESCOM", type: "debit" },
  { id: "t6", customer_id: "cust_001", amount: 800, timestamp: "2025-07-12", category: "entertainment", merchant: "Netflix", type: "debit" },
  { id: "t7", customer_id: "cust_001", amount: 2500, timestamp: "2025-07-15", category: "upi", merchant: "Swiggy", type: "debit" },
  { id: "t8", customer_id: "cust_001", amount: 1800, timestamp: "2025-07-18", category: "medical", merchant: "Apollo Pharmacy", type: "debit" },
  { id: "t9", customer_id: "cust_001", amount: 5000, timestamp: "2025-07-20", category: "transfer", merchant: "Family", type: "debit" },
  { id: "t10", customer_id: "cust_001", amount: 42000, timestamp: "2025-08-01", category: "salary", merchant: "Infosys Ltd", type: "credit" },
  { id: "t11", customer_id: "cust_001", amount: 12000, timestamp: "2025-08-02", category: "rent", merchant: "Landlord", type: "debit" },
  { id: "t12", customer_id: "cust_001", amount: 6500, timestamp: "2025-08-05", category: "emi", merchant: "HDFC Home Loan", type: "debit" },
  { id: "t13", customer_id: "cust_001", amount: 2800, timestamp: "2025-08-08", category: "grocery", merchant: "DMart", type: "debit" },
  { id: "t14", customer_id: "cust_001", amount: 45000, timestamp: "2025-08-20", category: "other", merchant: "Unknown Merchant", type: "debit" },
];

/* ── Balance History ── */
export const healthyBalanceHistory: BalancePoint[] = [
  { month: "Jan", balance: 18500 },
  { month: "Feb", balance: 21200 },
  { month: "Mar", balance: 19800 },
  { month: "Apr", balance: 24500 },
  { month: "May", balance: 26100 },
  { month: "Jun", balance: 28900 },
  { month: "Jul", balance: 32400 },
  { month: "Aug", balance: 35200 },
  { month: "Sep", balance: 38000 },
];

export const stressedBalanceHistory: BalancePoint[] = [
  { month: "Jan", balance: 32400 },
  { month: "Feb", balance: 28900 },
  { month: "Mar", balance: 26100 },
  { month: "Apr", balance: 21200 },
  { month: "May", balance: 18500 },
  { month: "Jun", balance: 14200 },
  { month: "Jul", balance: 9800 },
  { month: "Aug", balance: 5100 },
  { month: "Sep", balance: 2100 },
];

/* ── State Presets ── */
export const healthyState: CustomerState = {
  state: "healthy",
  signals: {
    income_regularity: 0.95,
    savings_rate: 19.5,
    foir: 0.155,
    balance_trend: "rising",
    spending_mix: { salary: 0, rent: 0.286, emi: 0.155, grocery: 0.076, upi: 0.06, utilities: 0.036, entertainment: 0.019, medical: 0.043, education: 0, transfer: 0.119, atm: 0, other: 0 },
    monthly_income: 42000,
    monthly_expenses: 21500,
    monthly_savings: 8200,
    monthly_emis: 6500,
    essential_spend: 21500,
  },
  why: "Your income is regular, savings rate is healthy at 19.5%, and EMI burden is well within safe limits.",
  score: 82,
};

export const vulnerableState: CustomerState = {
  state: "vulnerable",
  signals: {
    ...healthyState.signals,
    savings_rate: 9.2,
    foir: 0.28,
    balance_trend: "stable",
    monthly_savings: 3800,
    monthly_emis: 11500,
    essential_spend: 26800,
  },
  why: "Your EMI obligations have increased and savings rate has dropped. Monitor your spending closely.",
  score: 55,
};

export const stressedState: CustomerState = {
  state: "stressed",
  signals: {
    ...healthyState.signals,
    savings_rate: 5.0,
    foir: 0.42,
    balance_trend: "falling",
    monthly_savings: 2100,
    monthly_emis: 11500,
    essential_spend: 28500,
  },
  why: "Your obligations went up and balance is falling. EMI burden at 42% is above the safe threshold.",
  score: 28,
};

export const fraudState: CustomerState = {
  state: "fraud_risk",
  signals: {
    ...healthyState.signals,
    balance_trend: "falling",
  },
  why: "An unusual transaction of ₹45,000 was detected at 2:34 AM from an unknown merchant. This doesn't match your usual pattern.",
  score: 15,
};

/* ── Next Best Actions ── */
export const healthyNBA: NextBestAction = {
  action: "recommend",
  payload: {
    title: "Start a long-term savings plan",
    description: "Your income has been rising steadily. A recurring deposit could help you build a safety net.",
    cta_text: "Learn more",
    product: "Recurring Deposit",
  },
  reason: "Your income rose recently and savings stayed steady — this is a good time to start building wealth.",
  guardrail_passed: true,
};

export const stressedNBA: NextBestAction = {
  action: "support",
  payload: {
    title: "Let's work through your rising dues",
    description: "Your obligations went up and balance is falling. We can help you review spending and explore options.",
    cta_text: "Get support",
  },
  reason: "Loan and upsell recommendations are blocked because your financial health needs attention first.",
  guardrail_passed: true,
};

export const fraudNBA: NextBestAction = {
  action: "verify",
  payload: {
    title: "Unusual activity detected",
    description: "₹45,000 debited at 2:34 AM from an unknown merchant. This doesn't match your usual spending pattern.",
    cta_text: "Block & Report",
  },
  reason: "Saarthi flagged this because it doesn't match your usual pattern.",
  guardrail_passed: true,
};

/* ── Chat Responses ── */
export const mockChatResponses: Record<string, ChatResponse> = {
  greeting_en: {
    intent: "greeting",
    lang_detected: "en",
    reply_text: "Namaste! I'm Saarthi, your banking guide. How can I help you today?",
  },
  greeting_hi: {
    intent: "greeting",
    lang_detected: "hi",
    reply_text: "नमस्ते! मैं सारथी हूँ, आपका बैंकिंग गाइड। आज मैं आपकी कैसे मदद कर सकता हूँ?",
  },
  greeting_gu: {
    intent: "greeting",
    lang_detected: "gu",
    reply_text: "નમસ્તે! હું સારથી છું, તમારો બેન્કિંગ ગાઇડ. આજે હું તમને શું મદદ કરી શકું?",
  },
  loan_en: {
    intent: "loan_request",
    lang_detected: "en",
    reply_text: "Got it — home loan. Let me first check your repayment situation, then show you the best options.",
    journey_step: { step: 1, total: 6, label: "Understanding your needs", status: "completed" },
  },
  loan_hi: {
    intent: "loan_request",
    lang_detected: "hi",
    reply_text: "समझ गया — होम लोन। पहले मैं आपकी रीपेमेंट स्थिति देख लूँ, फिर सबसे अच्छा विकल्प बताऊँगा।",
    journey_step: { step: 1, total: 6, label: "आपकी ज़रूरत समझना", status: "completed" },
  },
  loan_gu: {
    intent: "loan_request",
    lang_detected: "gu",
    reply_text: "સમજ્યો — હોમ લોન. પહેલા તમારી રીપેમેન્ટ સ્થિતિ જોઈ લઉં, પછી શ્રેષ્ઠ વિકલ્પ બતાવું.",
    journey_step: { step: 1, total: 6, label: "તમારી જરૂરિયાત સમજવી", status: "completed" },
  },
  loan_stressed: {
    intent: "loan_request",
    lang_detected: "en",
    reply_text: "I understand you need a loan. However, I've noticed your current obligations are high. Let me first help you review your finances — we want to make sure any new commitment is comfortable for you.",
    journey_step: { step: 1, total: 6, label: "Reviewing your situation", status: "active" },
  },
  balance_en: {
    intent: "balance_check",
    lang_detected: "en",
    reply_text: "Your current balance is ₹38,000. You have ₹6,500 in EMIs due this week. After all obligations, you'll have about ₹8,200 available.",
  },
};

/* ── State resolver for demo events ── */
export function resolveStateAfterEvent(
  currentState: CustomerState,
  event: DemoEvent
): { state: CustomerState; nba: NextBestAction; balance: BalancePoint[] } {
  switch (event) {
    case "missed_emi":
    case "income_drop":
      return { state: stressedState, nba: stressedNBA, balance: stressedBalanceHistory };
    case "suspicious_debit":
      return { state: fraudState, nba: fraudNBA, balance: stressedBalanceHistory };
    case "salary_hike":
      return { state: healthyState, nba: healthyNBA, balance: healthyBalanceHistory };
    default:
      return { state: currentState, nba: healthyNBA, balance: healthyBalanceHistory };
  }
}
