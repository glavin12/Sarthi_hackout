"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import {
  CustomerState,
  NextBestAction,
  BalancePoint,
  DemoEvent,
} from "@/types";
import {
  mockCustomer,
  healthyState,
  healthyNBA,
  healthyBalanceHistory,
  stressedBalanceHistory,
  resolveStateAfterEvent,
} from "@/mocks/data";
import { PageShell } from "@/components/layout/page-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HealthGauge } from "@/components/dashboard/health-gauge";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { StressBanner } from "@/components/dashboard/stress-banner";
import { FraudAlert } from "@/components/dashboard/fraud-alert";
import { DemoControls } from "@/components/dashboard/demo-controls";
import { getDecision, injectEvent as apiInjectEvent } from "@/lib/api";

const CUSTOMER_ID = 1; // Default demo customer

function mapApiToState(apiData: any): { state: CustomerState; nba: NextBestAction } {
  const d = apiData?.data || apiData;
  const signals = d.signals || {};
  
  const stateMap: Record<string, number> = {
    healthy: 82, vulnerable: 55, stressed: 28, fraud_risk: 15,
  };
  
  const customerState: CustomerState = {
    state: d.state || "healthy",
    signals: {
      income_regularity: signals.income_regularity_score || 0.9,
      savings_rate: (signals.savings_rate || 0) * 100,
      foir: signals.foir || 0,
      balance_trend: signals.balance_trend === "sharp_decline" ? "falling" : signals.balance_trend || "stable",
      spending_mix: { salary: 0, rent: 0, emi: 0, grocery: 0, upi: 0, utilities: 0, entertainment: 0, medical: 0, education: 0, transfer: 0, atm: 0, other: 0 },
      monthly_income: signals.monthly_income || 0,
      monthly_expenses: signals.essential_spend || 0,
      monthly_savings: signals.savings_amount || 0,
      monthly_emis: signals.monthly_emi || 0,
      essential_spend: signals.essential_spend || 0,
    },
    why: d.plain_english_reason || "",
    score: stateMap[d.state] || 50,
  };

  const actionMap: Record<string, string> = {
    recommend_product: "recommend",
    budgeting_assistance: "guide",
    debt_support_call: "support",
    fraud_alert_verify: "verify",
    do_nothing: "nothing",
  };

  const nba: NextBestAction = {
    action: (actionMap[d.action] || "recommend") as any,
    payload: {
      title: d.title || "",
      description: d.message || "",
      cta_text: d.state === "stressed" ? "Get support" : d.state === "fraud_risk" ? "Block & Report" : "Learn more",
      product: d.recommended_product || undefined,
    },
    reason: d.plain_english_reason || "",
    guardrail_passed: !d.guardrail_applied,
  };

  return { state: customerState, nba };
}

export default function DashboardPage() {
  const [customerState, setCustomerState] = useState<CustomerState>(healthyState);
  const [nba, setNba] = useState<NextBestAction>(healthyNBA);
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>(healthyBalanceHistory);
  const [activeDemoEvent, setActiveDemoEvent] = useState<DemoEvent | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDecision = useCallback(async () => {
    try {
      const result = await getDecision(CUSTOMER_ID);
      const { state, nba: mappedNba } = mapApiToState(result);
      setCustomerState(state);
      setNba(mappedNba);
      setIsLive(true);
      // Update balance history based on state
      if (state.state === "stressed" || state.state === "fraud_risk") {
        setBalanceHistory(stressedBalanceHistory);
      } else {
        setBalanceHistory(healthyBalanceHistory);
      }
    } catch (err) {
      console.warn("Decision Engine unreachable, using mock data:", err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  const handleInjectEvent = async (event: DemoEvent) => {
    setActiveDemoEvent(event);
    
    if (isLive) {
      try {
        // Call Data Service to inject the event
        await apiInjectEvent(CUSTOMER_ID, event);
        // Re-fetch decision with updated data
        await fetchDecision();
        return;
      } catch (err) {
        console.warn("API inject failed, falling back to mock:", err);
      }
    }
    
    // Fallback to mock resolution
    const resolved = resolveStateAfterEvent(customerState, event);
    setCustomerState(resolved.state);
    setNba(resolved.nba);
    setBalanceHistory(resolved.balance);
  };

  const isFraudRisk = customerState.state === "fraud_risk";
  const isStressed = customerState.state === "stressed";

  return (
    <PageShell>
      <div className="space-y-5 max-w-6xl mx-auto pb-16">
        {/* Connection status indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-saarthi-text-muted">
          {isLive ? (
            <><Wifi className="w-3 h-3 text-saarthi-healthy" /> Live — Connected to Saarthi backends</>
          ) : (
            <><WifiOff className="w-3 h-3 text-saarthi-stressed" /> Offline — Using demo data</>
          )}
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div>
            <h1 className="text-xl font-light text-saarthi-text-primary tracking-tight">
              Namaste, {mockCustomer.name} 👋
            </h1>
            <p className="text-xs font-light text-saarthi-text-secondary mt-0.5">
              Financial vitals and automated guardrails
            </p>
          </div>
        </motion.div>

        {isFraudRisk && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <FraudAlert nba={nba} onConfirmLegitimate={() => handleInjectEvent("salary_hike")} onBlockAndReport={() => alert("Card activity blocked and fraud report submitted.")} />
          </motion.div>
        )}

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
          <MetricCard label="Monthly Income" value={customerState.signals.monthly_income} state={customerState.state} trend={activeDemoEvent === "income_drop" ? "down" : "stable"} />
          <MetricCard label="Essential Spend" value={customerState.signals.essential_spend} state={customerState.state} trend={isStressed ? "up" : "stable"} />
          <MetricCard label="Monthly Savings" value={customerState.signals.monthly_savings} state={customerState.state} trend={isStressed ? "down" : "up"} />
          <MetricCard label="Monthly EMIs" value={customerState.signals.monthly_emis} state={customerState.state} trend={isStressed ? "up" : "stable"} />
        </motion.div>

        {isStressed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
            <StressBanner />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <BalanceChart data={balanceHistory} state={customerState.state} />
          </div>
          <div className="lg:col-span-1">
            <RecommendationCard nba={nba} state={customerState.state} />
          </div>
        </motion.div>
      </div>

      <DemoControls onInjectEvent={handleInjectEvent} activeEvent={activeDemoEvent} />
    </PageShell>
  );
}

export { DashboardPage };
