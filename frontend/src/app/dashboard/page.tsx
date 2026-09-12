"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import {
  CustomerState,
  NextBestAction,
  BalancePoint,
  DemoEvent,
} from "@/types";
import {
  healthyState,
  healthyNBA,
  healthyBalanceHistory,
  resolveStateAfterEvent,
} from "@/mocks/data";
import { getDecision, getBalanceHistory, injectEvent, currentCustomerId, getCustomerSummary } from "@/lib/api";
import { useAppliedLoans } from "@/lib/loans";
import { usePrefs } from "@/lib/prefs";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/layout/page-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HealthGauge } from "@/components/dashboard/health-gauge";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { StressBanner } from "@/components/dashboard/stress-banner";
import { NewUserOnboarding } from "@/components/dashboard/new-user-onboarding";

export default function DashboardPage() {
  const router = useRouter();
  const [customerState, setCustomerState] = useState<CustomerState>(healthyState);
  const [nba, setNba] = useState<NextBestAction>(healthyNBA);
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>(healthyBalanceHistory);
  const { user } = useAuth();
  // Seed the local customer name from the logged-in session, not the
  // mock persona — otherwise every new user briefly sees "Ramesh Kumar"
  // before the backend fetch completes.
  const [customerName, setCustomerName] = useState<string>(user?.name || "");
  const [activeDemoEvent, setActiveDemoEvent] = useState<DemoEvent | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(false);
  const appliedLoans = useAppliedLoans(currentCustomerId());
  const extraEmi = appliedLoans.reduce((s, l) => s + l.monthlyEmi, 0);
  const [prefs] = usePrefs();
  const displayName = prefs.displayName || customerName || user?.name || "there";

  // Overlay the applied-loan EMI onto the backend/mock state so the
  // dashboard reflects "you just applied for a loan" without waiting on
  // real balances to catch up.
  const displaySignals = {
    ...customerState.signals,
    monthly_emis: customerState.signals.monthly_emis + extraEmi,
    monthly_savings: Math.max(0, customerState.signals.monthly_savings - extraEmi),
  };

  const refresh = async () => {
    // Ask data-service first — a brand-new account (no transactions) skips
    // the decision engine entirely; there's nothing meaningful to decide on.
    const summary = await getCustomerSummary();
    setCustomerName(summary.name);
    if (summary.is_new) {
      setIsNewCustomer(true);
      return;
    }
    setIsNewCustomer(false);
    const decision = await getDecision();
    setCustomerName(decision.customerName);
    setCustomerState(decision.state);
    setNba(decision.nba);
    setBalanceHistory(await getBalanceHistory());
  };

  useEffect(() => {
    refresh().catch((e) => console.warn("Backend unavailable, using mock data:", e));
  }, []);

  const handleInjectEvent = async (event: DemoEvent) => {
    setActiveDemoEvent(event);
    try {
      await injectEvent(event);
      await refresh();
    } catch (e) {
      console.warn("Inject via backend failed, using mock resolver:", e);
      const resolved = resolveStateAfterEvent(customerState, event);
      setCustomerState(resolved.state);
      setNba(resolved.nba);
      setBalanceHistory(resolved.balance);
    }
  };

  const handleRecommendationAction = (name: string) => {
    switch (name) {
      case "review_spending":
        router.push("/dashboard#spending");
        setTimeout(() => document.getElementById("spending")?.scrollIntoView({ behavior: "smooth" }), 50);
        break;
      case "get_support":
        router.push("/chat?intent=support");
        break;
      case "explore_options":
      case "learn_more":
      case "Learn more":
      case "Start plan":
        router.push("/loan-journey");
        break;
      case "this_was_me":
        handleInjectEvent("salary_hike");
        break;
      case "block_report":
        alert("Card activity blocked and fraud report submitted.");
        break;
      default:
        router.push("/loan-journey");
    }
  };

  const isStressed = customerState.state === "stressed";

  if (isNewCustomer) {
    return (
      <PageShell>
        <div className="space-y-5 max-w-6xl mx-auto pb-16">
          <NewUserOnboarding name={displayName} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-5 max-w-6xl mx-auto pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <h1 className="text-xl font-light text-saarthi-text-primary tracking-tight">
              Namaste, {displayName} 👋
            </h1>
            <p className="text-xs font-light text-saarthi-text-secondary mt-0.5">
              Financial vitals and automated guardrails
            </p>
          </div>
        </motion.div>

{isStressed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-saarthi-stressed/10 border border-saarthi-stressed/30 text-saarthi-stressed rounded-lg px-4 py-3 text-sm font-normal flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-saarthi-stressed" />
            <span className="tracking-wide">⚠ Saarthi noticed rising dues</span>
            <span className="text-xs text-saarthi-text-muted hidden md:inline ml-auto">Protective guardrails engaged</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <HealthGauge score={customerState.score} state={customerState.state} label="Financial health score" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Monthly Income" value={displaySignals.monthly_income} state={customerState.state} trend={activeDemoEvent === "income_drop" ? "down" : "stable"} />
          <MetricCard label="Essential Spend" value={displaySignals.essential_spend} state={customerState.state} trend={isStressed ? "up" : "stable"} />
          <MetricCard label="Monthly Savings" value={displaySignals.monthly_savings} state={customerState.state} trend={extraEmi > 0 ? "down" : isStressed ? "down" : "up"} />
          <MetricCard label="Monthly EMIs" value={displaySignals.monthly_emis} state={customerState.state} trend={extraEmi > 0 || isStressed ? "up" : "stable"} />
        </motion.div>

        {appliedLoans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.17 }}
            className="card p-4 border-l-2 border-l-saarthi-healthy"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-saarthi-text-muted">Active loans</span>
              <span className="text-[10px] font-light text-saarthi-text-secondary">
                Applied via Saarthi
              </span>
            </div>
            <ul className="divide-y divide-saarthi-border-subtle/60">
              {appliedLoans.map((l) => (
                <li key={l.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <div className="text-saarthi-text-primary font-normal truncate">{l.loanType}</div>
                    <div className="text-[11px] font-light text-saarthi-text-muted truncate">
                      {l.referenceId} · {l.interestRate} · {l.tenureMonths} months
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <div className="text-saarthi-text-primary font-normal">₹{l.monthlyEmi.toLocaleString("en-IN")}/mo</div>
                    <div className="text-[11px] font-light text-saarthi-text-muted">₹{l.amount.toLocaleString("en-IN")} sanctioned</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {isStressed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
            <StressBanner />
          </motion.div>
        )}

        <motion.div id="spending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <BalanceChart data={balanceHistory} state={customerState.state} />
          </div>
          <div className="lg:col-span-1">
            <RecommendationCard nba={nba} state={customerState.state} onActionClick={handleRecommendationAction} />
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
