'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Sparkles, Info } from 'lucide-react';
import { StepCard } from './step-card';
import { cn } from '@/lib/utils';

export interface LoanOption {
  id: string;
  name: string;
  amount: number;
  formattedAmount: string;
  interestRate: number;
  tenureYears: number;
  monthlyEmi: number;
  formattedEmi: string;
  isRecommended: boolean;
  why: string;
}

export const LOAN_OPTIONS_DATA: LoanOption[] = [
  {
    id: 'option-a',
    name: 'Option A · Balanced Tenure',
    amount: 300000,
    formattedAmount: '₹3,00,000',
    interestRate: 10.5,
    tenureYears: 5,
    monthlyEmi: 6450,
    formattedEmi: '₹6,450',
    isRecommended: true,
    why: 'Balanced monthly EMI of ₹6,450 keeps your FOIR well below 30%, giving you breathing room while borrowing ₹3,00,000.',
  },
  {
    id: 'option-b',
    name: 'Option B · Fast Payoff',
    amount: 200000,
    formattedAmount: '₹2,00,000',
    interestRate: 9.8,
    tenureYears: 3,
    monthlyEmi: 6520,
    formattedEmi: '₹6,520',
    isRecommended: false,
    why: 'Lowest interest rate (9.8%) and shorter 3-year term saves you ₹28,400 in total interest outflow over the loan life.',
  },
];

export interface StepOptionsProps {
  selectedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  className?: string;
}

/**
 * Step 4 — View Options
 * Side-by-side comparison of loan offers with expandable rationale.
 */
export function StepOptions({
  selectedOptionId = 'option-a',
  onSelectOption,
  className,
}: StepOptionsProps) {
  const [selectedId, setSelectedId] = useState<string>(selectedOptionId);
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({
    'option-a': true,
    'option-b': false,
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectOption?.(id);
  };

  const toggleWhy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedWhy((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <StepCard
      stepInfo="Step 4 of 6"
      title="Options that fit your profile"
      description="Compare these pre-approved offers and select the one aligned with your monthly comfort."
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LOAN_OPTIONS_DATA.map((opt) => {
          const isSelected = (selectedOptionId || selectedId) === opt.id;
          const isExpanded = !!expandedWhy[opt.id];

          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(opt.id);
                }
              }}
              className={cn(
                'relative bg-saarthi-card border rounded-lg p-4 cursor-pointer transition-all duration-150 flex flex-col justify-between',
                isSelected
                  ? 'border-saarthi-healthy ring-1 ring-saarthi-healthy/20 bg-saarthi-healthy/[0.02]'
                  : 'border-saarthi-border-subtle hover:border-saarthi-border-active'
              )}
            >
              {/* Header with pill and select indicator */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {opt.isRecommended ? (
                      <span className="pill-healthy inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-saarthi-healthy/10 text-saarthi-healthy border border-saarthi-healthy/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        Recommended
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted font-medium">
                        Standard Offer
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                      isSelected
                        ? 'border-saarthi-healthy bg-saarthi-healthy text-saarthi-bg'
                        : 'border-saarthi-border-subtle bg-saarthi-elevated'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                </div>

                {/* Amount and title */}
                <div className="mb-4">
                  <span className="text-xs font-light text-saarthi-text-muted block mb-0.5">
                    {opt.name}
                  </span>
                  <div className="text-2xl font-light text-saarthi-text-primary">
                    {opt.formattedAmount}
                  </div>
                </div>

                {/* Terms matrix */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-md bg-saarthi-elevated/70 border border-saarthi-border-subtle text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-saarthi-text-muted block">
                      Monthly EMI
                    </span>
                    <span className="text-sm font-normal text-saarthi-text-primary">
                      {opt.formattedEmi}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-saarthi-text-muted block">
                      Interest Rate
                    </span>
                    <span className="text-sm font-normal text-saarthi-healthy">
                      {opt.interestRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-saarthi-text-muted block">
                      Tenure
                    </span>
                    <span className="text-sm font-normal text-saarthi-text-primary">
                      {opt.tenureYears} Yrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable 'Why this option?' section */}
              <div className="pt-2 border-t border-saarthi-border-subtle">
                <button
                  type="button"
                  onClick={(e) => toggleWhy(e, opt.id)}
                  className="w-full flex items-center justify-between text-xs text-saarthi-text-secondary hover:text-saarthi-text-primary py-1 transition-colors group"
                >
                  <span className="inline-flex items-center gap-1.5 font-light">
                    <Info className="w-3.5 h-3.5 text-saarthi-healthy stroke-[1.5]" />
                    Why this option?
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-saarthi-text-muted group-hover:text-saarthi-text-primary transition-colors" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-saarthi-text-muted group-hover:text-saarthi-text-primary transition-colors" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-2.5 rounded bg-saarthi-elevated/40 border border-saarthi-border-subtle text-[11px] font-light text-saarthi-text-secondary leading-relaxed animate-fade-in">
                    {opt.why}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </StepCard>
  );
}

export default StepOptions;
