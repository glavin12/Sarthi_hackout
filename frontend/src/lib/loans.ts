"use client";

import { useEffect, useState } from "react";

// Applied loans are demo-only — persisted per user in localStorage so the
// dashboard reflects the new EMI right after applying.
// ponytail: localStorage keyed by customer id; upgrade path is a backend
// /customers/:id/loans table once loans stop being a demo fiction.

export interface AppliedLoan {
  id: string;
  customerId: string;
  loanType: string;
  amount: number;       // ₹
  monthlyEmi: number;   // ₹
  tenureMonths: number;
  interestRate: string;
  appliedAt: string;    // ISO
  referenceId: string;
}

const KEY = "saarthi.loans.applied";

function readAll(): AppliedLoan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppliedLoan[]) : [];
  } catch {
    return [];
  }
}

export function getAppliedLoans(customerId: string): AppliedLoan[] {
  return readAll().filter((l) => l.customerId === customerId);
}

export function totalAppliedEmi(customerId: string): number {
  return getAppliedLoans(customerId).reduce((sum, l) => sum + (l.monthlyEmi || 0), 0);
}

export function addAppliedLoan(loan: AppliedLoan): void {
  const all = readAll();
  all.push(loan);
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("saarthi:loans-change"));
}

export function removeAppliedLoan(id: string): void {
  const next = readAll().filter((l) => l.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("saarthi:loans-change"));
}

export function useAppliedLoans(customerId: string): AppliedLoan[] {
  const [loans, setLoans] = useState<AppliedLoan[]>([]);
  useEffect(() => {
    const sync = () => setLoans(getAppliedLoans(customerId));
    sync();
    window.addEventListener("saarthi:loans-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("saarthi:loans-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [customerId]);
  return loans;
}

/** Parse "₹6,450" or "3,00,000" into a number. Returns 0 on garbage. */
export function parseRupee(s: string | number | undefined | null): number {
  if (s == null) return 0;
  if (typeof s === "number") return s;
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
