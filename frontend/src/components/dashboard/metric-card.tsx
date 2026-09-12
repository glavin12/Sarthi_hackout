'use client';

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { CustomerStateType } from "@/types";
import { cn, formatCurrency, getStateBorder } from "@/lib/utils";
import { motion } from "framer-motion";

export interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "percentage";
  state: CustomerStateType;
  trend?: "up" | "down" | "stable";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  format = "currency",
  state,
  trend,
}) => {
  const isStressed = state === "stressed";
  const isSavingsOrEmi = label.toLowerCase().includes("saving") || label.toLowerCase().includes("emi");

  const formattedValue = format === "percentage" ? `${value.toFixed(1)}%` : formatCurrency(value);
  const valueColorClass = isStressed && isSavingsOrEmi ? "text-saarthi-stressed drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-saarthi-text-primary";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "card relative overflow-hidden group cursor-pointer",
        getStateBorder(state)
      )}
    >
      {/* Subtle sweeping gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Decorative inner glow for critical states */}
      {isStressed && isSavingsOrEmi && (
        <div className="absolute inset-0 bg-saarthi-stressed/[0.03] animate-pulse" />
      )}

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-wider text-saarthi-text-muted font-medium transition-colors group-hover:text-saarthi-text-secondary">
            {label}
          </span>
          {trend && (
            <div
              className={cn(
                "p-1 rounded-full bg-saarthi-elevated border transition-all duration-500",
                trend === "up" && "text-saarthi-healthy border-saarthi-healthy/20 group-hover:bg-saarthi-healthy/10",
                trend === "down" && "text-saarthi-stressed border-saarthi-stressed/20 group-hover:bg-saarthi-stressed/10",
                trend === "stable" && "text-saarthi-text-muted border-saarthi-border-subtle group-hover:border-saarthi-text-muted"
              )}
            >
              {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
              {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
              {trend === "stable" && <Minus className="w-3 h-3" />}
            </div>
          )}
        </div>

        <motion.div 
          key={formattedValue}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-2xl font-light tracking-tight", valueColorClass)}
        >
          {formattedValue}
        </motion.div>
      </div>
    </motion.div>
  );
};
