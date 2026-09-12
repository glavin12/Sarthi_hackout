"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Lock, User, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { loginUser, registerUser } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export default function WelcomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [income, setIncome] = useState("40000");
  const [occupation, setOccupation] = useState("Salaried");
  const [city, setCity] = useState("Bengaluru");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validEmail = (s: string) =>
    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(s.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    setBusy(true);
    try {
      const user =
        mode === "login"
          ? await loginUser(email, password)
          : await registerUser({
              email,
              password,
              name: name || email.split("@")[0],
              occupation,
              city,
              monthly_income: Number(income) || 40000,
            });
      setSession(user);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-saarthi-bg text-saarthi-text-primary">
      {/* Left — brand hero panel */}
      <aside className="lg:w-1/2 lg:min-h-screen relative overflow-hidden flex flex-col justify-between p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-saarthi-border-subtle">
        <div className="absolute inset-0 -z-10 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(0,212,170,0.14) 0%, transparent 50%), radial-gradient(circle at 80% 90%, rgba(0,212,170,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="flex items-center gap-3 select-none">
          <div className="relative flex items-center justify-center w-6 h-6">
            <span className="absolute w-2 h-2 rounded-full bg-saarthi-healthy animate-pulse shadow-[0_0_12px_rgba(0,212,170,1)]" />
            <span className="absolute w-6 h-6 rounded-full border border-saarthi-healthy/30 animate-[spin_4s_linear_infinite]" />
          </div>
          <span className="text-sm tracking-[0.35em] font-light uppercase">Saarthi</span>
        </div>

        <div className="max-w-md space-y-6 py-10">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl lg:text-4xl font-light tracking-tight leading-tight"
          >
            Your financial life,
            <br />
            <span className="text-saarthi-healthy">understood.</span>
          </motion.h1>
          <p className="text-sm font-light text-saarthi-text-secondary leading-relaxed">
            Saarthi reads your real income and spending patterns, protects you from unusual activity, and only recommends what you can safely afford.
          </p>
          <ul className="space-y-2 text-xs font-light text-saarthi-text-secondary">
            <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-saarthi-healthy" /> Personalised next-best-actions from a live model</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-saarthi-healthy" /> Automatic guardrails during stress or fraud risk</li>
            <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-saarthi-healthy" /> Talk in Hindi, Gujarati, or English</li>
          </ul>
        </div>

        <div className="text-[11px] font-light text-saarthi-text-muted">
          Demo build. All data stays on this device.
        </div>
      </aside>

      {/* Right — auth form */}
      <main className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-6">
          {/* Segmented control */}
          <div className="grid grid-cols-2 p-1 rounded-md bg-saarthi-card border border-saarthi-border-subtle">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={cn(
                  "text-xs py-1.5 rounded transition-all",
                  mode === m
                    ? "bg-saarthi-elevated text-saarthi-text-primary shadow-sm font-medium"
                    : "text-saarthi-text-muted hover:text-saarthi-text-secondary font-normal",
                )}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-light tracking-tight">
              {mode === "login" ? "Welcome back" : "Say hi to Saarthi"}
            </h2>
            <p className="text-xs font-light text-saarthi-text-secondary mt-1">
              {mode === "login"
                ? "Enter your email and password to continue."
                : "A few details — we'll tailor your dashboard from the start."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <AnimatePresence initial={false}>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-3"
                >
                  <Field icon={<User className="w-3.5 h-3.5" />} label="Full name">
                    <input required value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Priya Sharma" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Occupation">
                      <input value={occupation} onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Salaried" className={inputCls} />
                    </Field>
                    <Field label="City">
                      <input value={city} onChange={(e) => setCity(e.target.value)}
                        placeholder="Bengaluru" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Monthly income (₹)">
                    <input inputMode="numeric" value={income}
                      onChange={(e) => setIncome(e.target.value.replace(/\D/g, ""))}
                      placeholder="40000" className={inputCls} />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            <Field icon={<Mail className="w-3.5 h-3.5" />} label="Email">
              <input required type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputCls} />
            </Field>
            <Field icon={<Lock className="w-3.5 h-3.5" />} label="Password">
              <input required type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters" className={inputCls} />
            </Field>

            {error && (
              <div className="text-xs text-saarthi-stressed bg-saarthi-stressed/10 border border-saarthi-stressed/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-saarthi-healthy text-saarthi-bg text-sm font-medium hover:bg-saarthi-healthy/90 disabled:opacity-40 transition-all">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> :
                mode === "login" ? "Sign in" : "Create my account"}
              {!busy && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          <p className="text-[11px] font-light text-saarthi-text-muted text-center pt-2">
            {mode === "login"
              ? "New to Saarthi? Tap 'Create account' above."
              : "Already have an account? Tap 'Sign in' above."}
          </p>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full bg-saarthi-card border border-saarthi-border-subtle rounded-md px-3 py-2 text-sm font-light text-saarthi-text-primary placeholder:text-saarthi-text-muted focus:outline-none focus:border-saarthi-healthy/50 transition-colors";

function Field({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
