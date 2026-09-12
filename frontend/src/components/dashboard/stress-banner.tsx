import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StressBannerProps {
  className?: string;
}

/**
 * StressBanner acts as an anti-predatory guardrail banner shown when a customer
 * is in a stressed financial state. It affirms that credit upselling is suppressed.
 */
export const StressBanner: React.FC<StressBannerProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "bg-saarthi-card border border-saarthi-border-subtle rounded-md py-3 px-4 flex items-center justify-between animate-fade-in transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2.5 text-sm font-light text-saarthi-text-secondary">
        <span className="text-saarthi-text-muted select-none text-xs font-mono">✕</span>
        <span>
          No new-
          <span className="line-through text-saarthi-text-muted">loan offers</span>{" "}
          shown
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-saarthi-healthy font-light">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px]">Anti-predatory guardrail active</span>
      </div>
    </div>
  );
};

export default StressBanner;
