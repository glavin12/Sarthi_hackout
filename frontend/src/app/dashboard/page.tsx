"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
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

/**
 * Adaptive Dashboard for Saarthi.
 * Dynamically shifts UI posture, styling, and recommendations based on CustomerState:
 * - Healthy: Green/teal metrics, wealth-building actions, upward trends.
 * - Vulnerable: Amber indicators, advisory cautions.
 * - Stressed: Red alert bar, anti-predatory loan suppression banner, debt relief actions.
 * - Fraud Risk: Urgent security verification alert banner, card freeze actions.
 */
export default function DashboardPage() {
  const [customerState, setCustomerState] = useState<CustomerState>(healthyState);
  const [nba, setNba] = useState<NextBestAction>(healthyNBA);
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>(
    healthyBalanceHistory
  );
  const [activeDemoEvent, setActiveDemoEvent] = useState<DemoEvent | null>(null);

  const handleInjectEvent = (event: DemoEvent) => {
    setActiveDemoEvent(event);
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

        {/* If fraud_risk: show FraudAlert at top */}
        {isFraudRisk && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <FraudAlert
              nba={nba}
              onConfirmLegitimate={() => handleInjectEvent("salary_hike")}
              onBlockAndReport={() => {
                alert("Card activity blocked and fraud report submitted.");
              }}
            />
          </motion.div>
        )}

        {/* If stressed: show red alert bar '⚠ Saarthi noticed rising dues' */}
        {isStressed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-saarthi-stressed/10 border border-saarthi-stressed/30 text-saarthi-stressed rounded-lg px-4 py-3 text-sm font-normal flex items-center gap-2.5 animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-saarthi-stressed" />
            <span className="tracking-wide">
              ⚠ Saarthi noticed rising dues
            </span>
            <span className="text-xs text-saarthi-text-muted hidden md:inline ml-auto">
              Protective guardrails engaged
            </span>
          </motion.div>
        )}

        {/* Health gauge row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <HealthGauge
            score={customerState.score}
            state={customerState.state}
            label="Financial health score"
          />
        </motion.div>

        {/* Grid of 4 MetricCards (income, essential_spend, savings, emis) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <MetricCard
            label="Monthly Income"
            value={customerState.signals.monthly_income}
            state={customerState.state}
            trend={activeDemoEvent === "income_drop" ? "down" : "stable"}
          />
          <MetricCard
            label="Essential Spend"
            value={customerState.signals.essential_spend}
            state={customerState.state}
            trend={isStressed ? "up" : "stable"}
          />
          <MetricCard
            label="Monthly Savings"
            value={customerState.signals.monthly_savings}
            state={customerState.state}
            trend={isStressed ? "down" : "up"}
          />
          <MetricCard
            label="Monthly EMIs"
            value={customerState.signals.monthly_emis}
            state={customerState.state}
            trend={isStressed ? "up" : "stable"}
          />
        </motion.div>

        {/* If stressed: show StressBanner */}
        {isStressed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <StressBanner />
          </motion.div>
        )}

        {/* Two-column grid below: BalanceChart (col-span-2) + RecommendationCard (col-span-1) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <div className="lg:col-span-2">
            <BalanceChart data={balanceHistory} state={customerState.state} />
          </div>
          <div className="lg:col-span-1">
            <RecommendationCard nba={nba} state={customerState.state} />
          </div>
        </motion.div>
      </div>

      {/* Floating DemoControls */}
      <DemoControls
        onInjectEvent={handleInjectEvent}
        activeEvent={activeDemoEvent}
      />
    </PageShell>
  );
}

export { DashboardPage };

