'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare, PieChart, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomerStateType } from '@/types';
import { StepCard } from './step-card';
import { cn } from '@/lib/utils';

export interface StepEligibilityProps {
  state: CustomerStateType;
  onReviewFinances?: () => void;
  onTalkToAdvisor?: () => void;
  className?: string;
}

/**
 * Step 3 — Check Eligibility
 * Real-time eligibility evaluation based on user financial state.
 * Healthy/Vulnerable profiles receive pre-approved term cards.
 * Stressed profiles receive an empathetic financial protection redirect.
 */
export function StepEligibility({
  state,
  onReviewFinances,
  onTalkToAdvisor,
  className,
}: StepEligibilityProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Reset loading whenever state changes, then resolve after 2 seconds
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [state]);

  const isStressed = state === 'stressed' || state === 'fraud_risk';

  const handleReviewClick = () => {
    if (onReviewFinances) {
      onReviewFinances();
    } else {
      router.push('/dashboard');
    }
  };

  const handleAdvisorClick = () => {
    if (onTalkToAdvisor) {
      onTalkToAdvisor();
    } else {
      router.push('/chat');
    }
  };

  return (
    <StepCard
      stepInfo="Step 3 of 6"
      title={isLoading ? 'Checking your eligibility' : isStressed ? 'Financial Health Check' : "You're eligible!"}
      description={
        isLoading
          ? 'Scanning cash flow regularity, existing liabilities, and FOIR ratio...'
          : isStressed
          ? 'We want to help, not add burden.'
          : 'Great news! Your credit and repayment track record pre-qualify you for immediate disbursement.'
      }
      className={className}
    >
      {/* 1. Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-saarthi-healthy animate-spin stroke-[1.5]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-normal text-saarthi-text-primary">
              Analysing your financial profile...
            </p>
            <p className="text-xs font-light text-saarthi-text-muted">
              Running automated guardrail and debt-to-income checks
            </p>
          </div>
        </div>
      )}

      {/* 2. Stressed / High Burden State: Empathetic Redirect */}
      {!isLoading && isStressed && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-lg bg-saarthi-stressed/10 border border-saarthi-stressed/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-saarthi-stressed/20 text-saarthi-stressed flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-saarthi-text-primary">
                  We want to help, not add burden
                </h3>
                <p className="text-xs font-light text-saarthi-text-secondary leading-relaxed">
                  Your current monthly obligations (EMIs & fixed dues) stand at <span className="text-saarthi-stressed font-normal">42%</span> of your monthly income. Taking on a new loan at this stage could stretch your budget and risk financial stress.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-saarthi-elevated border border-saarthi-border-subtle text-xs font-light text-saarthi-text-muted space-y-1.5">
            <div className="text-saarthi-text-primary font-medium text-xs">
              Saarthi's Responsible Lending Promise
            </div>
            <p className="leading-relaxed">
              Our AI is programmed never to push debt that harms your long-term wellness. Instead, let's explore restructuring or reviewing discretionary expenses to bring your obligations down to safe limits (&lt;30%).
            </p>
          </div>

          {/* Action buttons for stressed state */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleReviewClick}
              className="btn-outline flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-saarthi-border-subtle bg-saarthi-elevated text-xs font-normal text-saarthi-text-primary hover:border-saarthi-border-active hover:bg-saarthi-elevated/80 transition-colors"
            >
              <PieChart className="w-3.5 h-3.5 text-saarthi-healthy" />
              Review my finances
            </button>
            <button
              type="button"
              onClick={handleAdvisorClick}
              className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-normal hover:bg-saarthi-healthy/90 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
              Talk to advisor
            </button>
          </div>
        </div>
      )}

      {/* 3. Healthy / Vulnerable Eligible State */}
      {!isLoading && !isStressed && (
        <div className="space-y-4 animate-fade-in">
          {/* Eligibility Banner */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-saarthi-healthy/10 border border-saarthi-healthy/20">
            <div className="w-8 h-8 rounded-full bg-saarthi-healthy/20 text-saarthi-healthy flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-saarthi-healthy block">
                Pre-Approved Limit Available
              </span>
              <span className="text-xs font-light text-saarthi-text-secondary">
                Verified through 18 months of disciplined credit behavior and 19.5% savings rate.
              </span>
            </div>
          </div>

          {/* Loan Details Grid Card */}
          <div className="rounded-lg bg-saarthi-elevated border border-saarthi-border-subtle p-4">
            <div className="text-[10px] uppercase tracking-wider text-saarthi-text-muted font-medium mb-3">
              Approved Terms Summary
            </div>

            <div className="grid grid-cols-3 gap-3 divide-x divide-saarthi-border-subtle">
              <div className="pr-2">
                <span className="text-[11px] font-light text-saarthi-text-muted block mb-0.5">
                  Max Amount
                </span>
                <span className="text-base font-light text-saarthi-text-primary">
                  ₹5,00,000
                </span>
              </div>

              <div className="px-3">
                <span className="text-[11px] font-light text-saarthi-text-muted block mb-0.5">
                  Interest Rate
                </span>
                <span className="text-base font-light text-saarthi-healthy">
                  9.8% <span className="text-xs text-saarthi-text-muted">p.a.</span>
                </span>
              </div>

              <div className="pl-3">
                <span className="text-[11px] font-light text-saarthi-text-muted block mb-0.5">
                  Max Tenure
                </span>
                <span className="text-base font-light text-saarthi-text-primary">
                  60 mos
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-light text-saarthi-text-muted leading-relaxed">
            Zero prepayment charges after 6 months. Continue to the next step to review personalized repayment schedules.
          </p>
        </div>
      )}
    </StepCard>
  );
}

export default StepEligibility;
