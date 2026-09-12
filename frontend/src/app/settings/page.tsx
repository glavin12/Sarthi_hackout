"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save, Bell, User, ShieldCheck, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { useAuth, clearSession } from "@/lib/auth";
import { usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [prefs, savePrefs] = usePrefs();
  const [displayName, setDisplayName] = useState(prefs.displayName ?? user?.name ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePrefs({ displayName: displayName.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/welcome");
  };

  const handleWipe = () => {
    if (!confirm("This clears your local goals, applied loans, and preferences on this device. Continue?")) return;
    ["saarthi.goals", "saarthi.loans.applied", "saarthi.prefs"].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("saarthi:goals-change"));
    window.dispatchEvent(new Event("saarthi:loans-change"));
    window.dispatchEvent(new Event("saarthi:prefs-change"));
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-light tracking-tight">Settings</h1>
          <p className="text-xs font-light text-saarthi-text-secondary mt-0.5">
            Manage your Saarthi profile, preferences, and data.
          </p>
        </div>

        {/* Profile */}
        <section className="card space-y-4 p-5">
          <SectionHeader icon={<User className="w-3.5 h-3.5" />} title="Profile" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Display name">
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.name ?? "Your name"} className={inputCls} />
            </Field>
            <Field label="Email">
              <input value={user?.email ?? ""} disabled className={cn(inputCls, "opacity-60 cursor-not-allowed")} />
            </Field>
          </div>
          <div className="text-[11px] font-light text-saarthi-text-muted">
            Customer ID <span className="font-mono">{user?.customer_id ?? "—"}</span> · KYC verified
          </div>
        </section>

        {/* Notifications */}
        <section className="card space-y-3 p-5">
          <SectionHeader icon={<Bell className="w-3.5 h-3.5" />} title="Notifications" />
          <Toggle
            label="Fraud & unusual activity alerts"
            hint="High-priority — recommended to keep on."
            value={prefs.notifyFraud}
            onChange={(v) => savePrefs({ notifyFraud: v })}
          />
          <Toggle
            label="Goal milestones"
            hint="Nudge when you hit 25 / 50 / 75 / 100% of a savings goal."
            value={prefs.notifyGoals}
            onChange={(v) => savePrefs({ notifyGoals: v })}
          />
          <Toggle
            label="Budget & spending insights"
            hint="Weekly summary of where your money went."
            value={prefs.notifyBudget}
            onChange={(v) => savePrefs({ notifyBudget: v })}
          />
        </section>

        {/* Data */}
        <section className="card space-y-3 p-5">
          <SectionHeader icon={<ShieldCheck className="w-3.5 h-3.5" />} title="Your data" />
          <p className="text-[11px] font-light text-saarthi-text-secondary">
            Goals, applied loans, and preferences are stored locally on this device. They never leave your browser.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={handleWipe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-saarthi-stressed/40 text-saarthi-stressed text-xs hover:bg-saarthi-stressed/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear local data
            </button>
          </div>
        </section>

        {/* Save profile */}
        <div className="pt-1">
          <button type="button" onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-medium hover:bg-saarthi-healthy/90 transition-all">
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved" : "Save profile"}
          </button>
        </div>

        {/* Account — sign out is its own card so users can find it */}
        <section className="card space-y-3 p-5 border-l-2 border-l-saarthi-stressed/40">
          <SectionHeader icon={<LogOut className="w-3.5 h-3.5" />} title="Account" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-normal text-saarthi-text-primary truncate">
                Signed in as {user?.email ?? "—"}
              </div>
              <div className="text-[11px] font-light text-saarthi-text-muted">
                Signing out clears your session on this device only.
              </div>
            </div>
            <button type="button" onClick={handleLogout}
              className="shrink-0 inline-flex items-center gap-1.5 py-2 px-4 rounded-md bg-saarthi-stressed text-white text-xs font-medium hover:bg-saarthi-stressed/90 transition-all">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

const inputCls =
  "w-full bg-saarthi-card border border-saarthi-border-subtle rounded-md px-3 py-2 text-sm font-light text-saarthi-text-primary placeholder:text-saarthi-text-muted focus:outline-none focus:border-saarthi-healthy/50 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted">{label}</span>
      {children}
    </label>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-saarthi-text-muted">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function Toggle({ label, hint, value, onChange }: {
  label: string; hint?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="text-sm font-normal text-saarthi-text-primary">{label}</div>
        {hint && <div className="text-[11px] font-light text-saarthi-text-muted">{hint}</div>}
      </div>
      <button type="button" role="switch" aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors shrink-0",
          value ? "bg-saarthi-healthy" : "bg-saarthi-elevated border border-saarthi-border-subtle",
        )}>
        <span className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
          value ? "left-4" : "left-0.5",
        )} />
      </button>
    </div>
  );
}
