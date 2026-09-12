"use client";

import React, { useState } from "react";
import { Beaker, ChevronDown, ChevronUp } from "lucide-react";
import { DemoEvent } from "@/types";
import { cn } from "@/lib/utils";

export interface DemoControlsProps {
  onInjectEvent: (event: DemoEvent) => void;
  activeEvent?: DemoEvent | null;
}

const DEMO_ACTIONS: Array<{ label: string; event: DemoEvent }> = [
  { label: "Missed EMI", event: "missed_emi" },
  { label: "Income Drop", event: "income_drop" },
  { label: "Suspicious Debit", event: "suspicious_debit" },
  { label: "Salary Hike", event: "salary_hike" },
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
        <div className="bg-saarthi-elevated border border-saarthi-border-subtle rounded-lg p-3 shadow-2xl w-64 backdrop-blur-sm transition-all duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-saarthi-border-subtle/60">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-saarthi-healthy" />
              <span className="text-xs uppercase tracking-wider text-saarthi-text-muted font-normal">
                Demo Controls
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-saarthi-text-muted hover:text-saarthi-text-primary p-1 rounded transition-colors"
              title="Minimize panel"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACTIONS.map(({ label, event }) => {
              const isActive = activeEvent === event;
              return (
                <button
                  key={event}
                  type="button"
                  onClick={() => onInjectEvent(event)}
                  className={cn(
                    "text-xs py-1.5 px-2 rounded border border-saarthi-border-subtle hover:bg-saarthi-card transition-colors text-left truncate font-normal",
                    isActive
                      ? "border-saarthi-healthy text-saarthi-healthy bg-saarthi-healthy/10"
                      : "text-saarthi-text-secondary hover:text-saarthi-text-primary"
                  )}
                  title={`Inject ${label}`}
                >
                  {label}
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
          title="Open Demo Controls"
        >
          <Beaker className="w-4 h-4 text-saarthi-healthy" />
          <span>Demo Controls</span>
          <ChevronUp className="w-3.5 h-3.5 text-saarthi-text-muted" />
        </button>
      )}
    </div>
  );
};

export default DemoControls;
