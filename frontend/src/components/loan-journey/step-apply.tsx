'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight, Check, Sparkles, FileText, Landmark } from 'lucide-react';
import { StepCard } from './step-card';
import { cn } from '@/lib/utils';

export interface LoanApplicationSummary {
  loanType?: string;
  amount?: string;
  interestRate?: string;
  tenure?: string;
  monthlyEmi?: string;
  processingFee?: string;
  disbursementAccount?: string;
}

export interface StepApplyProps {
  summary?: LoanApplicationSummary;
  onSubmitSuccess?: () => void;
  className?: string;
}

const DEFAULT_SUMMARY: LoanApplicationSummary = {
  loanType: 'Home Loan',
  amount: '₹3,00,000',
  interestRate: '10.5% p.a.',
  tenure: '5 Years (60 Months)',
  monthlyEmi: '₹6,450',
  processingFee: '₹0 (Pre-approved waiver)',
  disbursementAccount: 'Infosys Salary Account •••• 4021',
};

/**
 * Step 6 — Apply & Sanction
 * Review all loan terms, agree to regulatory declarations, and submit application.
 */
export function StepApply({
  summary = DEFAULT_SUMMARY,
  onSubmitSuccess,
  className,
}: StepApplyProps) {
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const appliedSummary = {
    ...DEFAULT_SUMMARY,
    ...summary,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate instant decisioning and disbursement pipeline
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSubmitSuccess?.();
    }, 1200);
  };

  // Success State View
  if (isSubmitted) {
    return (
      <div
        className={cn(
          'bg-saarthi-card border border-saarthi-healthy/30 rounded-lg p-6 sm:p-8 animate-fade-in text-center space-y-6',
          className
        )}
      >
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-saarthi-healthy/15 text-saarthi-healthy flex items-center justify-center ring-8 ring-saarthi-healthy/5 animate-pulse">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <span className="text-[10px] uppercase tracking-wider text-saarthi-healthy font-medium">
            Application Approved & Queued
          </span>
          <h2 className="text-xl font-light text-saarthi-text-primary tracking-tight">
            Application submitted!
          </h2>
          <p className="text-xs font-light text-saarthi-text-secondary leading-relaxed">
            Your reference ID is{' '}
            <span className="text-saarthi-text-primary font-mono font-normal">
              SAR-LN-2026-8891
            </span>
            . Funds will be disbursed within 24 hours into your primary account ending in ••4021.
          </p>
        </div>

        {/* Sanction Details Recap */}
        <div className="max-w-md mx-auto rounded-lg bg-saarthi-elevated border border-saarthi-border-subtle p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs py-1 border-b border-saarthi-border-subtle">
            <span className="text-saarthi-text-muted font-light">Sanctioned Amount</span>
            <span className="text-saarthi-text-primary font-normal">{appliedSummary.amount}</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-saarthi-border-subtle">
            <span className="text-saarthi-text-muted font-light">First Monthly EMI</span>
            <span className="text-saarthi-healthy font-normal">{appliedSummary.monthlyEmi}</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-saarthi-text-muted font-light">Disbursement Timeline</span>
            <span className="text-saarthi-text-primary font-normal">Today, by 6:00 PM IST</span>
          </div>
        </div>

        {/* Action Link CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-normal hover:bg-saarthi-healthy/90 transition-colors shadow-sm"
          >
            Return to Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/chat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-saarthi-border-subtle bg-saarthi-elevated text-xs font-normal text-saarthi-text-primary hover:border-saarthi-border-active hover:bg-saarthi-elevated/80 transition-colors"
          >
            Ask Saarthi Questions
          </Link>
        </div>
      </div>
    );
  }

  // Pre-submission Review Form
  return (
    <StepCard
      stepInfo="Step 6 of 6"
      title="Review and apply"
      description="Verify key loan terms and acknowledge the mandate before instant sanction."
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary Card */}
        <div className="rounded-lg bg-saarthi-elevated border border-saarthi-border-subtle p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-saarthi-border-subtle">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted font-medium block">
                Selected Facility
              </span>
              <span className="text-sm font-normal text-saarthi-text-primary">
                {appliedSummary.loanType}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted font-medium block">
                Sanction Limit
              </span>
              <span className="text-base font-light text-saarthi-healthy">
                {appliedSummary.amount}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-saarthi-text-muted font-light block mb-0.5">
                Interest Rate
              </span>
              <span className="text-saarthi-text-primary font-normal">
                {appliedSummary.interestRate}
              </span>
            </div>
            <div>
              <span className="text-saarthi-text-muted font-light block mb-0.5">
                Tenure
              </span>
              <span className="text-saarthi-text-primary font-normal">
                {appliedSummary.tenure}
              </span>
            </div>
            <div>
              <span className="text-saarthi-text-muted font-light block mb-0.5">
                Monthly EMI
              </span>
              <span className="text-saarthi-text-primary font-normal">
                {appliedSummary.monthlyEmi}
              </span>
            </div>
            <div>
              <span className="text-saarthi-text-muted font-light block mb-0.5">
                Processing Fee
              </span>
              <span className="text-saarthi-healthy font-normal">
                {appliedSummary.processingFee}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-saarthi-text-muted font-light block mb-0.5">
                Disbursement Target
              </span>
              <span className="text-saarthi-text-primary font-normal flex items-center gap-1">
                <Landmark className="w-3 h-3 text-saarthi-healthy shrink-0" />
                {appliedSummary.disbursementAccount}
              </span>
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="p-3 rounded-md bg-saarthi-elevated/50 border border-saarthi-border-subtle flex items-start gap-3">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-saarthi-border-subtle bg-saarthi-card text-saarthi-healthy focus:ring-saarthi-healthy/20 cursor-pointer accent-[#00D4AA]"
          />
          <label
            htmlFor="terms-checkbox"
            className="text-xs font-light text-saarthi-text-secondary leading-relaxed cursor-pointer select-none"
          >
            I confirm that the provided details are accurate, acknowledge the Key Fact Statement (KFS), and authorize Saarthi to initiate automated EMI NACH mandate on my salary account.
          </label>
        </div>

        {/* Submit Application Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!agreedToTerms || isSubmitting}
            className={cn(
              'btn-primary w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-normal transition-all',
              'bg-saarthi-healthy text-saarthi-bg hover:bg-saarthi-healthy/90',
              (!agreedToTerms || isSubmitting) && 'opacity-40 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-saarthi-bg border-t-transparent animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 stroke-[2]" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </StepCard>
  );
}

export default StepApply;
