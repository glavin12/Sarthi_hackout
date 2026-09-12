import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as Indian Rupees */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format compact currency (e.g. ₹42K) */
export function formatCompact(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
}

/** Get state color class */
export function getStateColor(state: string): string {
  switch (state) {
    case "healthy": return "text-saarthi-healthy";
    case "vulnerable": return "text-saarthi-vulnerable";
    case "stressed": return "text-saarthi-stressed";
    case "fraud_risk": return "text-saarthi-fraud";
    default: return "text-saarthi-text-secondary";
  }
}

/** Get state background class */
export function getStateBg(state: string): string {
  switch (state) {
    case "healthy": return "bg-saarthi-healthy/10";
    case "vulnerable": return "bg-saarthi-vulnerable/10";
    case "stressed": return "bg-saarthi-stressed/10";
    case "fraud_risk": return "bg-saarthi-fraud/10";
    default: return "bg-saarthi-card";
  }
}

/** Get state border class */
export function getStateBorder(state: string): string {
  switch (state) {
    case "healthy": return "border-saarthi-healthy/30";
    case "vulnerable": return "border-saarthi-vulnerable/30";
    case "stressed": return "border-saarthi-stressed/30";
    case "fraud_risk": return "border-saarthi-fraud/30";
    default: return "border-saarthi-border-subtle";
  }
}

/** Get pill class for state */
export function getStatePill(state: string): string {
  switch (state) {
    case "healthy": return "pill-healthy";
    case "vulnerable": return "pill-vulnerable";
    case "stressed": return "pill-stressed";
    case "fraud_risk": return "pill-fraud";
    default: return "pill-healthy";
  }
}

/** Get state label */
export function getStateLabel(state: string): string {
  switch (state) {
    case "healthy": return "Stable";
    case "vulnerable": return "Caution";
    case "stressed": return "Needs Attention";
    case "fraud_risk": return "Alert";
    default: return "Unknown";
  }
}

/** Delay utility */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
