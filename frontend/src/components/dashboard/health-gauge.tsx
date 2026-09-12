"use client";

import React from "react";
import { CustomerStateType } from "@/types";
import { cn, getStatePill, getStateLabel } from "@/lib/utils";
import { motion } from "framer-motion";

export interface HealthGaugeProps {
  score: number;
  state: CustomerStateType;
  label: string;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({
  score,
  state,
  label,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Dynamic gradient fill with box-shadow for glowing effect
  const stateFillGradients: Record<CustomerStateType, string> = {
    healthy: "bg-gradient-to-r from-[#00A884] to-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.6)]",
    vulnerable: "bg-gradient-to-r from-[#D97706] to-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.6)]",
    stressed: "bg-gradient-to-r from-[#DC2626] to-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.6)]",
    fraud_risk: "bg-gradient-to-r from-[#EA580C] to-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.6)]",
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="card relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-saarthi-text-primary tracking-wide">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <motion.span 
            key={normalizedScore}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-light text-saarthi-text-primary drop-shadow-md"
          >
            {normalizedScore}
          </motion.span>
          <span className="text-xs text-saarthi-text-muted font-light">/100</span>
        </div>
      </div>

      <div className="relative h-2 w-full rounded-full bg-saarthi-bg overflow-hidden border border-saarthi-border-subtle shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedScore}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "h-full rounded-full relative",
            stateFillGradients[state] || "bg-saarthi-healthy"
          )}
        >
          {/* Shimmer effect */}
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2.5s_infinite]" />
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={cn("transition-colors duration-300", getStatePill(state))}>
          {getStateLabel(state)}
        </span>
        <span className="text-[11px] text-saarthi-text-muted font-normal group-hover:text-saarthi-text-secondary transition-colors">
          {state === "healthy" ? "Finances in good order" : state === "vulnerable" ? "Caution recommended" : state === "stressed" ? "High obligations detected" : "Requires prompt verification"}
        </span>
      </div>
    </motion.div>
  );
};

export default HealthGauge;
