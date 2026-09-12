"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { NextBestAction } from "@/types";
import { cn } from "@/lib/utils";

export interface FraudAlertProps {
  nba: NextBestAction;
  onConfirmLegitimate?: () => void;
  onBlockAndReport?: () => void;
  className?: string;
}

/**
 * FraudAlert displays an urgent security notification banner with quick-response
 * actions to allow or immediately block suspicious activity.
 */
export const FraudAlert: React.FC<FraudAlertProps> = ({
  nba,
  onConfirmLegitimate,
  onBlockAndReport,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "bg-saarthi-fraud/10 border border-saarthi-fraud/30 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-full bg-saarthi-fraud/20 text-saarthi-fraud shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-saarthi-fraud" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-saarthi-text-primary tracking-wide">
            {nba.payload.title}
          </h4>
          <p className="text-sm font-normal text-saarthi-text-secondary mt-0.5 leading-relaxed">
            {nba.payload.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
        <button
          type="button"
          onClick={onConfirmLegitimate}
          className="btn-outline px-3.5 py-1.5 rounded-md border border-saarthi-border-active hover:bg-saarthi-elevated text-saarthi-text-secondary hover:text-saarthi-text-primary text-xs font-normal transition-colors"
        >
          This was me
        </button>
        <button
          type="button"
          onClick={onBlockAndReport}
          className="btn-danger px-3.5 py-1.5 rounded-md bg-saarthi-fraud text-white hover:bg-saarthi-fraud/90 text-xs font-normal shadow-sm active:scale-[0.98] transition-all"
        >
          Block & Report
        </button>
      </div>
    </div>
  );
};

export default FraudAlert;
