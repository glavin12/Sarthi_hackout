/**
 * Saarthi API Client — connects Frontend to all backend services.
 * Falls back to mock data if backends are unreachable (for offline dev).
 */

const DECISION_ENGINE_URL = process.env.NEXT_PUBLIC_DECISION_ENGINE_URL || 'http://localhost:8001';
const NLP_SERVICE_URL = process.env.NEXT_PUBLIC_NLP_SERVICE_URL || 'http://localhost:8002';
const DATA_SERVICE_URL = process.env.NEXT_PUBLIC_DATA_SERVICE_URL || 'http://localhost:8000';

// --- Decision Engine ---

export async function getDecision(customerId: string | number): Promise<any> {
  const res = await fetch(`${DECISION_ENGINE_URL}/api/v1/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: String(customerId) }),
  });
  if (!res.ok) throw new Error(`Decision Engine error: ${res.status}`);
  return res.json();
}

export async function evaluateIntent(customerId: string | number, action: string): Promise<any> {
  const res = await fetch(`${DECISION_ENGINE_URL}/api/v1/evaluate-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: String(customerId), proposed_action: action }),
  });
  if (!res.ok) throw new Error(`Evaluate intent error: ${res.status}`);
  return res.json();
}

// --- NLP / Chat Service ---

export async function sendChatMessage(
  customerId: number,
  text: string,
  lang: string
): Promise<any> {
  const res = await fetch(`${NLP_SERVICE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId, text, lang }),
  });
  if (!res.ok) throw new Error(`NLP Service error: ${res.status}`);
  return res.json();
}

// --- Data Service ---

export async function getCustomers(): Promise<any[]> {
  const res = await fetch(`${DATA_SERVICE_URL}/customers`);
  if (!res.ok) throw new Error(`Data Service error: ${res.status}`);
  return res.json();
}

export async function getCustomer(customerId: number): Promise<any> {
  const res = await fetch(`${DATA_SERVICE_URL}/customers/${customerId}`);
  if (!res.ok) throw new Error(`Data Service error: ${res.status}`);
  return res.json();
}

export async function getTransactions(customerId: number): Promise<any[]> {
  const res = await fetch(`${DATA_SERVICE_URL}/customers/${customerId}/transactions`);
  if (!res.ok) throw new Error(`Data Service error: ${res.status}`);
  return res.json();
}

export async function injectEvent(
  customerId: number,
  event: string
): Promise<any> {
  const res = await fetch(`${DATA_SERVICE_URL}/customers/${customerId}/inject-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
  });
  if (!res.ok) throw new Error(`Inject event error: ${res.status}`);
  return res.json();
}

// --- Health checks ---

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
    check(`${DATA_SERVICE_URL}/health`),
    check(`${DECISION_ENGINE_URL}/health`),
    check(`${NLP_SERVICE_URL}/health`),
  ]);

  return { dataService, decisionEngine, nlpService };
}
