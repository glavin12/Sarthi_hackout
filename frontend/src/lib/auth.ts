"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "./api";

const STORAGE_KEY = "saarthi.auth.user";

// ponytail: localStorage session, no JWT. If we ever leave demo land, swap
// this file for a cookie/JWT client without touching callers.

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("saarthi:auth-change"));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("saarthi:auth-change"));
}

export function useAuth(): { user: AuthUser | null; ready: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setUser(getSession());
    setReady(true);
    const sync = () => setUser(getSession());
    window.addEventListener("saarthi:auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("saarthi:auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { user, ready };
}
