'use client';

import React, { useState } from 'react';
import { ChevronDown, Building2, Briefcase, UserCheck } from 'lucide-react';
import { StepCard } from './step-card';
import { cn } from '@/lib/utils';

export type EmploymentType = 'Salaried' | 'Self-employed' | 'Business';

export interface StepInfoData {
  monthlyIncome: string;
  employmentType: EmploymentType;
  loanAmount: string;
}

export interface StepInfoProps {
  initialData?: Partial<StepInfoData>;
  onChange?: (data: StepInfoData) => void;
  onContinue?: () => void;
  className?: string;
}

/**
 * Step 2 — Basic Information
 * Gathers user's financial details with pre-filled verified data.
 */
export function StepInfo({
  initialData,
  onChange,
  onContinue,
  className,
}: StepInfoProps) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>(
    initialData?.monthlyIncome ?? '42,000'
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialData?.employmentType ?? 'Salaried'
  );
  const [loanAmount, setLoanAmount] = useState<string>(
    initialData?.loanAmount ?? '2,50,000'
  );

  const updateData = (
    income: string,
    emp: EmploymentType,
    amount: string
  ) => {
    onChange?.({
      monthlyIncome: income,
      employmentType: emp,
      loanAmount: amount,
    });
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setMonthlyIncome(val);
    updateData(val, employmentType, loanAmount);
  };

  const handleEmploymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as EmploymentType;
    setEmploymentType(val);
    updateData(monthlyIncome, val, loanAmount);
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLoanAmount(val);
    updateData(monthlyIncome, employmentType, val);
  };

  return (
    <StepCard
      stepInfo="Step 2 of 6"
      title="A few quick details"
      description="We've pre-filled what we know from your primary bank account. Feel free to adjust if needed."
      className={className}
    >
      <div className="space-y-4">
        {/* Field 1: Monthly Income */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="monthlyIncome"
              className="text-xs text-saarthi-text-muted block"
            >
              Monthly Income
            </label>
            <span className="text-[10px] text-saarthi-healthy font-light flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-saarthi-healthy" />
              Verified via Infosys salary credits
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-light text-saarthi-text-muted select-none">
              ₹
            </span>
            <input
              id="monthlyIncome"
              type="text"
              value={monthlyIncome}
              onChange={handleIncomeChange}
              placeholder="42,000"
              className="bg-saarthi-elevated border border-saarthi-border-subtle rounded-md pl-7 pr-3 py-2 text-sm font-light text-saarthi-text-primary w-full focus:outline-none focus:border-saarthi-border-active transition-colors"
            />
          </div>
        </div>

        {/* Field 2: Employment Type */}
        <div>
          <label
            htmlFor="employmentType"
            className="text-xs text-saarthi-text-muted mb-1 block"
          >
            Employment Type
          </label>
          <div className="relative">
            <select
              id="employmentType"
              value={employmentType}
              onChange={handleEmploymentChange}
              className="bg-saarthi-elevated border border-saarthi-border-subtle rounded-md px-3 py-2 text-sm font-light text-saarthi-text-primary w-full appearance-none focus:outline-none focus:border-saarthi-border-active transition-colors cursor-pointer pr-9"
            >
              <option value="Salaried" className="bg-saarthi-card text-saarthi-text-primary">
                Salaried (Private / Public Sector)
              </option>
              <option value="Self-employed" className="bg-saarthi-card text-saarthi-text-primary">
                Self-employed Professional
              </option>
              <option value="Business" className="bg-saarthi-card text-saarthi-text-primary">
                Business Owner / Partner
              </option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-saarthi-text-muted">
              <ChevronDown className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* Field 3: Loan Amount Needed */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="loanAmount"
              className="text-xs text-saarthi-text-muted block"
            >
              Loan Amount Needed
            </label>
            <span className="text-[10px] text-saarthi-text-muted font-light">
              Range: ₹50,000 – ₹10,00,000
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-light text-saarthi-text-muted select-none">
              ₹
            </span>
            <input
              id="loanAmount"
              type="text"
              value={loanAmount}
              onChange={handleLoanAmountChange}
              placeholder="2,50,000"
              className="bg-saarthi-elevated border border-saarthi-border-subtle rounded-md pl-7 pr-3 py-2 text-sm font-light text-saarthi-text-primary w-full focus:outline-none focus:border-saarthi-border-active transition-colors"
            />
          </div>
        </div>

        {/* Trust badge */}
        <div className="p-2.5 rounded-md bg-saarthi-elevated/40 border border-saarthi-border-subtle flex items-start gap-2.5 mt-2">
          <UserCheck className="w-4 h-4 text-saarthi-healthy shrink-0 mt-0.5" />
          <p className="text-xs font-light text-saarthi-text-muted leading-relaxed">
            Your FOIR (Fixed Obligations to Income Ratio) will be calculated in real time to protect your monthly savings buffer.
          </p>
        </div>
      </div>
    </StepCard>
  );
}

export default StepInfo;
