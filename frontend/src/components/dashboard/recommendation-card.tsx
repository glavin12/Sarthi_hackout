"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, ShieldAlert, HeartHandshake } from "lucide-react";
import { NextBestAction, CustomerStateType } from "@/types";
import { cn } from "@/lib/utils";

export interface RecommendationCardProps {
  nba: NextBestAction;
  state: CustomerStateType;
  onActionClick?: (actionName: string) => void;
}

/**
 * RecommendationCard displays the AI-driven Next Best Action (NBA).
 * It adapts its posture based on the customer state:
 * - Healthy: growth recommendations + expandable "Why?" reasoning + action CTA
 * - Stressed: supportive messaging + spending review / hardship options
 * - Fraud: urgent verification + transaction resolution actions
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  nba,
  state,
  onActionClick,
}) => {
  const [whyOpen, setWhyOpen] = useState(false);

  // Left border-l-2 colored by state
  const stateBorderLeftMap: Record<CustomerStateType, string> = {
    healthy: "border-l-[#00D4AA]",
    vulnerable: "border-l-[#F59E0B]",
    stressed: "border-l-[#EF4444]",
    fraud_risk: "border-l-[#F97316]",
  };

  const handleAction = (name: string) => {
    if (onActionClick) {
      onActionClick(name);
    }
  };

  return (
    <div
      className={cn(
        "card p-5 border-l-2 flex flex-col justify-between h-full transition-all duration-300",
        stateBorderLeftMap[state] || "border-l-saarthi-border-subtle"
      )}
    >
      <div>
        {/* Header tag */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-saarthi-text-muted font-normal flex items-center gap-1.5">
            {state === "healthy" && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-saarthi-healthy" />
                Next Best Action
              </>
            )}
            {state === "stressed" && (
              <>
                <HeartHandshake className="w-3.5 h-3.5 text-saarthi-stressed" />
                Financial Support
              </>
            )}
            {state === "fraud_risk" && (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-saarthi-fraud" />
                Security Alert
              </>
            )}
            {state === "vulnerable" && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-saarthi-vulnerable" />
                Financial Advisory
              </>
            )}
          </span>

          {nba.payload.product && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-saarthi-elevated text-saarthi-text-secondary border border-saarthi-border-subtle">
              {nba.payload.product}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-normal text-saarthi-text-primary mb-1.5">
          {nba.payload.title}
        </h3>
        <p className="text-sm font-light text-saarthi-text-secondary leading-relaxed mb-4">
          {nba.payload.description}
        </p>

        {/* Expandable 'Why?' Section */}
        {nba.reason && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setWhyOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-normal text-saarthi-healthy hover:text-saarthi-healthy/80 transition-colors focus:outline-none"
            >
              <span>Why?</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  whyOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {whyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-saarthi-elevated/60 border border-saarthi-border-subtle rounded-md text-xs font-light text-saarthi-text-secondary leading-relaxed">
                    {nba.reason}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons based on state */}
      <div className="pt-2 border-t border-saarthi-border-subtle/50 mt-2">
        {state === "healthy" && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleAction(nba.payload.cta_text || "learn_more")}
              className="px-4 py-2 rounded-md bg-saarthi-healthy text-[#0A0A0B] text-xs font-medium hover:bg-saarthi-healthy/90 active:scale-[0.98] transition-all"
            >
              {nba.payload.cta_text || "Start plan"}
            </button>
          </div>
        )}

        {state === "stressed" && (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleAction("review_spending")}
              className="px-3 py-1.5 rounded-md border border-saarthi-border-subtle text-xs font-normal text-saarthi-text-secondary hover:text-saarthi-text-primary hover:bg-saarthi-card transition-colors"
            >
              Review Spending
            </button>
            <button
              type="button"
              onClick={() => handleAction("get_support")}
              className="px-3.5 py-1.5 rounded-md bg-saarthi-stressed text-white text-xs font-normal hover:bg-saarthi-stressed/90 active:scale-[0.98] transition-colors"
            >
              Get Support
            </button>
          </div>
        )}

        {state === "fraud_risk" && (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleAction("this_was_me")}
              className="px-3 py-1.5 rounded-md border border-saarthi-border-subtle text-xs font-normal text-saarthi-text-secondary hover:text-saarthi-text-primary hover:bg-saarthi-card transition-colors"
            >
              This was me
            </button>
            <button
              type="button"
              onClick={() => handleAction("block_report")}
              className="px-3.5 py-1.5 rounded-md bg-saarthi-fraud text-white text-xs font-normal hover:bg-saarthi-fraud/90 active:scale-[0.98] transition-colors"
            >
              Block & Report
            </button>
          </div>
        )}

        {state === "vulnerable" && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleAction("explore_options")}
              className="px-4 py-2 rounded-md bg-saarthi-vulnerable text-[#0A0A0B] text-xs font-medium hover:bg-saarthi-vulnerable/90 active:scale-[0.98] transition-all"
            >
              Explore Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
