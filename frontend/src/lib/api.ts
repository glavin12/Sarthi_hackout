import { BalancePoint, ChatResponse, CustomerState, DemoEvent, NextBestAction } from "@/types";
import { chatToResponse, decisionToNba, decisionToState, txnsToBalanceHistory } from "./adapters";

const DATA = process.env.NEXT_PUBLIC_DATA_SERVICE_URL || "http://localhost:8000";
const DECISION = process.env.NEXT_PUBLIC_DECISION_ENGINE_URL || "http://localhost:8001";
const NLP = process.env.NEXT_PUBLIC_NLP_URL || "http://localhost:8002";

const FALLBACK_CUSTOMER_ID = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID || "1";

/** Read the logged-in customer id from localStorage, falling back to the demo id. */
export function currentCustomerId(): string {
  if (typeof window === "undefined") return FALLBACK_CUSTOMER_ID;
  try {
    const raw = localStorage.getItem("saarthi.auth.user");
    if (!raw) return FALLBACK_CUSTOMER_ID;
    const u = JSON.parse(raw);
    return String(u.customer_id || FALLBACK_CUSTOMER_ID);
  } catch {
    return FALLBACK_CUSTOMER_ID;
  }
}

export const DEMO_CUSTOMER_ID = FALLBACK_CUSTOMER_ID;

export interface DecisionResult {
  customerName: string;
  state: CustomerState;
  nba: NextBestAction;
}

export async function getDecision(customerId = currentCustomerId()): Promise<DecisionResult> {
  const res = await fetch(`${DECISION}/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId }),
  });
  if (!res.ok) throw new Error(`decide ${res.status}`);
  const data = (await res.json()).data;
  return { customerName: data.customer_name, state: decisionToState(data), nba: decisionToNba(data) };
}

export async function injectEvent(event: DemoEvent, customerId = currentCustomerId()): Promise<void> {
  const res = await fetch(`${DATA}/customers/${customerId}/inject-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  });
  if (!res.ok) throw new Error(`inject-event ${res.status}`);
}

export async function getBalanceHistory(customerId = currentCustomerId()): Promise<BalancePoint[]> {
  const res = await fetch(`${DATA}/api/v1/customers/${customerId}/transactions`);
  if (!res.ok) throw new Error(`transactions ${res.status}`);
  return txnsToBalanceHistory(await res.json());
}

export async function sendChatMessage(
  customerId: number,
  text: string,
  lang: string
): Promise<any> {
  const res = await fetch(`${NLP}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId, text, lang }),
  });
  if (!res.ok) throw new Error(`NLP Service error: ${res.status}`);
  return res.json();
}

export interface AuthUser {
  customer_id: number;
  email: string;
  name: string;
}

export interface CustomerSummary {
  customer_id: number;
  name: string;
  transaction_count: number;
  is_new: boolean;
  monthly_income: number;
}

export async function getCustomerSummary(
  customerId = currentCustomerId(),
): Promise<CustomerSummary> {
  const res = await fetch(`${DATA}/customers/${customerId}/summary`);
  if (!res.ok) throw new Error(`summary ${res.status}`);
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${DATA}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `login ${res.status}`);
  }
  return res.json();
}

export async function registerUser(body: {
  email: string;
  password: string;
  name: string;
  occupation?: string;
  city?: string;
  monthly_income?: number;
  persona_type?: string;
}): Promise<AuthUser> {
  const res = await fetch(`${DATA}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `register ${res.status}`);
  }
  return res.json();
}

export async function checkHealth(): Promise<{
  dataService: boolean;
  decisionEngine: boolean;
  nlpService: boolean;
}> {
  const check = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  };
  const [dataService, decisionEngine, nlpService] = await Promise.all([
    check(`${DATA}/health`),
    check(`${DECISION}/health`),
    check(`${NLP}/health`),
  ]);
  return { dataService, decisionEngine, nlpService };
}
