'use client';

import React from 'react';
import { Home, User, Car, GraduationCap, LucideIcon, Check } from 'lucide-react';
import { StepCard } from './step-card';
import { cn } from '@/lib/utils';

export interface LoanCategoryOption {
  id: string;
  label: string;
  description: string;
  rateHint: string;
  icon: LucideIcon;
}

export const LOAN_OPTIONS: LoanCategoryOption[] = [
  {
    id: 'home',
    label: 'Home Loan',
    description: 'Purchase, construction, or plot transfer',
    rateHint: 'From 8.4% p.a.',
    icon: Home,
  },
  {
    id: 'personal',
    label: 'Personal Loan',
    description: 'Quick liquidity for lifestyle & emergencies',
    rateHint: 'From 10.5% p.a.',
    icon: User,
  },
  {
    id: 'vehicle',
    label: 'Vehicle Loan',
    description: 'Two-wheelers, four-wheelers & EVs',
    rateHint: 'From 8.9% p.a.',
    icon: Car,
  },
  {
    id: 'education',
    label: 'Education Loan',
    description: 'Higher studies in India or overseas',
    rateHint: 'From 9.2% p.a.',
    icon: GraduationCap,
  },
];

export interface StepIntentProps {
  selectedLoan?: string;
  onSelect: (loanType: string) => void;
  className?: string;
}

/**
 * Step 1 — Understand Intent
 * Lets the customer choose the specific category of loan they need.
 */
export function StepIntent({
  selectedLoan = 'home',
  onSelect,
  className,
}: StepIntentProps) {
  return (
    <StepCard
      stepInfo="Step 1 of 6"
      title="What kind of loan do you need?"
      description="Choose a loan type to personalize your terms and interest rate evaluation."
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LOAN_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedLoan === option.id;

          return (
            <div
              key={option.id}
              onClick={() => onSelect(option.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(option.id);
                }
              }}
              className={cn(
                'group relative flex flex-col justify-between rounded-md p-3.5 text-sm font-light cursor-pointer transition-all duration-150 select-none border',
                'bg-saarthi-elevated hover:bg-saarthi-elevated/80',
                isSelected
                  ? 'border-saarthi-healthy bg-saarthi-healthy/5 ring-1 ring-saarthi-healthy/30'
                  : 'border-saarthi-border-subtle hover:border-saarthi-border-active'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-saarthi-healthy/15 text-saarthi-healthy'
                      : 'bg-saarthi-card text-saarthi-text-secondary group-hover:text-saarthi-text-primary'
                  )}
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                </div>

                {isSelected ? (
                  <span className="w-4 h-4 rounded-full bg-saarthi-healthy/20 text-saarthi-healthy flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="text-[10px] font-light text-saarthi-text-muted">
                    {option.rateHint}
                  </span>
                )}
              </div>

              <div>
                <h3
                  className={cn(
                    'text-sm font-normal transition-colors',
                    isSelected ? 'text-saarthi-text-primary' : 'text-saarthi-text-primary'
                  )}
                >
                  {option.label}
                </h3>
                <p className="text-xs font-light text-saarthi-text-muted mt-0.5 leading-snug line-clamp-2">
                  {option.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </StepCard>
  );
}

export default StepIntent;
