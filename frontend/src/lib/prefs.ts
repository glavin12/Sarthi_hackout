"use client";

import { useEffect, useState } from "react";

// Per-user preferences (language, notification toggles). LocalStorage only.

export type LangPref = "en" | "hi" | "gu";

export interface Prefs {
  defaultLang: LangPref;
  notifyFraud: boolean;
  notifyGoals: boolean;
  notifyBudget: boolean;
  displayName?: string;
}

const KEY = "saarthi.prefs";

const DEFAULT: Prefs = {
  defaultLang: "en",
  notifyFraud: true,
  notifyGoals: true,
  notifyBudget: false,
};

export function getPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function setPrefs(p: Partial<Prefs>): void {
  const next = { ...getPrefs(), ...p };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("saarthi:prefs-change"));
}

export function usePrefs(): [Prefs, (p: Partial<Prefs>) => void] {
  const [prefs, setState] = useState<Prefs>(DEFAULT);
  useEffect(() => {
    const sync = () => setState(getPrefs());
    sync();
    window.addEventListener("saarthi:prefs-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("saarthi:prefs-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [prefs, setPrefs];
}
