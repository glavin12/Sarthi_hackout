"use client";

import { useEffect, useState } from "react";

// Savings goals — per-user localStorage. Deposits are additive; nothing
// leaves the browser. Upgrade path is a backend /goals table.

export interface SavingsGoal {
  id: string;
  customerId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  createdAt: string;
  deadline?: string;
  emoji: string;
}

const KEY = "saarthi.goals";

function readAll(): SavingsGoal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavingsGoal[]) : [];
  } catch {
    return [];
  }
}

function writeAll(goals: SavingsGoal[]): void {
  localStorage.setItem(KEY, JSON.stringify(goals));
  window.dispatchEvent(new Event("saarthi:goals-change"));
}

export function getGoals(customerId: string): SavingsGoal[] {
  return readAll().filter((g) => g.customerId === customerId);
}

export function addGoal(g: Omit<SavingsGoal, "id" | "createdAt" | "savedAmount">): SavingsGoal {
  const goal: SavingsGoal = {
    ...g,
    id: `goal-${Date.now()}`,
    createdAt: new Date().toISOString(),
    savedAmount: 0,
  };
  writeAll([...readAll(), goal]);
  return goal;
}

export function contribute(id: string, amount: number): void {
  const all = readAll();
  const next = all.map((g) =>
    g.id === id ? { ...g, savedAmount: Math.max(0, g.savedAmount + amount) } : g,
  );
  writeAll(next);
}

export function deleteGoal(id: string): void {
  writeAll(readAll().filter((g) => g.id !== id));
}

export function useGoals(customerId: string): SavingsGoal[] {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  useEffect(() => {
    const sync = () => setGoals(getGoals(customerId));
    sync();
    window.addEventListener("saarthi:goals-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("saarthi:goals-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [customerId]);
  return goals;
}
