"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, TrendingDown, ShieldAlert, TrendingUp } from "lucide-react";
import { DemoEvent } from "@/types";
import { cn } from "@/lib/utils";

export interface DemoControlsProps {
  onInjectEvent: (event: DemoEvent) => void;
  activeEvent?: DemoEvent | null;
}

// Each button simulates a real-world life event and asks the backend to
// append the matching transaction. The dashboard then re-evaluates state
// (healthy → stressed / fraud / etc.) so reviewers see Saarthi react live.
const DEMO_ACTIONS: Array<{
  label: string;
  hint: string;
  event: DemoEvent;
  icon: React.ComponentType<{ className?: string }>;
  tone: "danger" | "warn" | "good";
}> = [
  {
    label: "Missed a loan EMI",
    hint: "You didn't pay a scheduled loan EMI this month.",
    event: "missed_emi",
    icon: AlertTriangle,
    tone: "warn",
  },
  {
    label: "Salary was cut",
    hint: "This month's salary came in ~50% lower than usual.",
    event: "income_drop",
    icon: TrendingDown,
    tone: "warn",
  },
  {
    label: "Unusual card activity",
    hint: "A large debit hit your card at 2:47 AM from an unknown merchant.",
    event: "suspicious_debit",
    icon: ShieldAlert,
    tone: "danger",
  },
  {
    label: "Got a raise",
    hint: "Your salary just went up by 30% — Saarthi should suggest saving more.",
    event: "salary_hike",
    icon: TrendingUp,
    tone: "good",
  },
];

/**
 * DemoControls provides a floating switcher to simulate various life/banking events
 * (missed EMI, income drops, fraud alerts, salary hikes) to demonstrate Saarthi's adaptive posture.
 */
export const DemoControls: React.FC<DemoControlsProps> = ({
  onInjectEvent,
  activeEvent,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {isOpen ? (
        <div className="bg-saarthi-elevated border border-saarthi-border-subtle rounded-lg p-3 shadow-2xl w-72 backdrop-blur-sm transition-all duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-saarthi-border-subtle/60">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-saarthi-healthy" />
                <span className="text-xs uppercase tracking-wider text-saarthi-text-muted font-normal">
                  Simulate a life event
                </span>
              </div>
              <span className="text-[10px] font-light text-saarthi-text-muted mt-0.5">
                Watch Saarthi react in real time.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-saarthi-text-muted hover:text-saarthi-text-primary p-1 rounded transition-colors"
              title="Minimize"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {DEMO_ACTIONS.map(({ label, hint, event, icon: Icon, tone }) => {
              const isActive = activeEvent === event;
              const toneCls =
                tone === "danger" ? "text-saarthi-fraud" :
                tone === "warn" ? "text-saarthi-stressed" :
                "text-saarthi-healthy";
              return (
                <button
                  key={event}
                  type="button"
                  onClick={() => onInjectEvent(event)}
                  className={cn(
                    "w-full flex items-start gap-2 text-left p-2 rounded-md border transition-colors",
                    isActive
                      ? "border-saarthi-healthy bg-saarthi-healthy/10"
                      : "border-saarthi-border-subtle hover:bg-saarthi-card hover:border-saarthi-border-active"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", toneCls)} />
                  <div className="min-w-0">
                    <div className="text-xs font-normal text-saarthi-text-primary leading-snug">
                      {label}
                    </div>
                    <div className="text-[10px] font-light text-saarthi-text-muted leading-snug mt-0.5">
                      {hint}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-saarthi-elevated hover:bg-saarthi-card border border-saarthi-border-subtle text-saarthi-text-secondary hover:text-saarthi-text-primary px-3 py-2 rounded-lg shadow-lg text-xs font-normal transition-all duration-200"
          title="Simulate a life event"
        >
          <Sparkles className="w-4 h-4 text-saarthi-healthy" />
          <span>Try a life event</span>
          <ChevronUp className="w-3.5 h-3.5 text-saarthi-text-muted" />
        </button>
      )}
    </div>
  );
};

export default DemoControls;
