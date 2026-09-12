'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { ProgressStepper } from '@/components/loan-journey/progress-stepper';
import { StepIntent, LOAN_OPTIONS } from '@/components/loan-journey/step-intent';
import { StepInfo, StepInfoData } from '@/components/loan-journey/step-info';
import { StepEligibility } from '@/components/loan-journey/step-eligibility';
import { StepOptions, LOAN_OPTIONS_DATA } from '@/components/loan-journey/step-options';
import { StepDocuments, DocumentItem } from '@/components/loan-journey/step-documents';
import { StepApply, LoanApplicationSummary } from '@/components/loan-journey/step-apply';
import { healthyState, stressedState, vulnerableState } from '@/mocks/data';
import { CustomerState, CustomerStateType } from '@/types';
import { cn } from '@/lib/utils';

const STEP_LABELS = [
  'Understand Intent',
  'Basic Info',
  'Check Eligibility',
  'View Options',
  'Documents',
  'Apply',
];

/**
 * LoanJourneyPage Component
 *
 * Guided multi-step loan onboarding journey for Saarthi.
 * Implements conversational intelligence, progressive disclosure,
 * responsive checks, and responsible lending guardrails.
 */
function LoanJourneyPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedLoan, setSelectedLoan] = useState<string>('home');
  const [customerState, setCustomerState] = useState<CustomerState>(healthyState);
  const [stepInfoData, setStepInfoData] = useState<StepInfoData>({
    monthlyIncome: '42,000',
    employmentType: 'Salaried',
    loanAmount: '3,00,000',
  });
  const [selectedOptionId, setSelectedOptionId] = useState<string>('option-a');
  const [documents, setDocuments] = useState<DocumentItem[]>();
  const [isApplicationCompleted, setIsApplicationCompleted] = useState<boolean>(false);

  // Compute stepper step items
  const stepperSteps = STEP_LABELS.map((label, idx) => {
    let status: 'completed' | 'active' | 'pending' = 'pending';
    if (idx < currentStep) {
      status = 'completed';
    } else if (idx === currentStep) {
      status = 'active';
    }
    return { label, status };
  });

  const handleNext = () => {
    if (currentStep < STEP_LABELS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Find loan display label
  const currentLoanMeta = LOAN_OPTIONS.find((l) => l.id === selectedLoan);
  const currentOptionMeta = LOAN_OPTIONS_DATA.find((o) => o.id === selectedOptionId);

  // Construct application summary dynamically
  const applicationSummary: LoanApplicationSummary = {
    loanType: currentLoanMeta?.label ?? 'Home Loan',
    amount: currentOptionMeta?.formattedAmount ?? `₹${stepInfoData.loanAmount}`,
    interestRate: currentOptionMeta ? `${currentOptionMeta.interestRate}% p.a.` : '10.5% p.a.',
    tenure: currentOptionMeta ? `${currentOptionMeta.tenureYears} Years (${currentOptionMeta.tenureYears * 12} Months)` : '5 Years',
    monthlyEmi: currentOptionMeta?.formattedEmi ?? '₹6,450',
    processingFee: '₹0 (Pre-approved waiver)',
    disbursementAccount: 'Infosys Salary Account •••• 4021',
  };

  // Demo state switcher options
  const stateOptions: { label: string; state: CustomerState }[] = [
    { label: 'Healthy Profile', state: healthyState },
    { label: 'Vulnerable Profile', state: vulnerableState },
    { label: 'Stressed Profile', state: stressedState },
  ];

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Bar with Title and Demo State Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-saarthi-border-subtle">
          <div>
            <h1 className="text-lg font-light text-saarthi-text-primary tracking-tight">
              Loan Journey
            </h1>
            <p className="text-xs font-light text-saarthi-text-muted mt-0.5">
              Personalized lending with automated guardrails &amp; transparent terms
            </p>
          </div>

          {/* Quick Demo State Selector (lets reviewer test stressed guardrail) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-saarthi-card border border-saarthi-border-subtle rounded-md p-1">
            <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted px-1.5 font-medium">
              Demo State:
            </span>
            {stateOptions.map((opt) => {
              const isActive = customerState.state === opt.state.state;
              return (
                <button
                  key={opt.state.state}
                  type="button"
                  onClick={() => setCustomerState(opt.state)}
                  className={cn(
                    'px-2 py-0.5 text-[11px] rounded transition-all font-light',
                    isActive
                      ? opt.state.state === 'healthy'
                        ? 'bg-saarthi-healthy/20 text-saarthi-healthy font-normal'
                        : opt.state.state === 'vulnerable'
                        ? 'bg-saarthi-vulnerable/20 text-saarthi-vulnerable font-normal'
                        : 'bg-saarthi-stressed/20 text-saarthi-stressed font-normal'
                      : 'text-saarthi-text-muted hover:text-saarthi-text-secondary'
                  )}
                >
                  {opt.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Stepper at top */}
        <div className="bg-saarthi-card/60 border border-saarthi-border-subtle rounded-lg p-4 sm:p-5">
          <ProgressStepper
            currentStep={currentStep}
            steps={stepperSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Active Step Content */}
        <div className="min-h-[360px]">
          {currentStep === 0 && (
            <StepIntent
              selectedLoan={selectedLoan}
              onSelect={(type) => {
                setSelectedLoan(type);
              }}
            />
          )}

          {currentStep === 1 && (
            <StepInfo
              initialData={stepInfoData}
              onChange={(data) => setStepInfoData(data)}
            />
          )}

          {currentStep === 2 && (
            <StepEligibility
              state={customerState.state}
              onReviewFinances={() => {
                // Can navigate to dashboard or reset
                setCurrentStep(0);
              }}
              onTalkToAdvisor={() => {
                // Navigate to chat
                window.location.href = '/chat';
              }}
            />
          )}

          {currentStep === 3 && (
            <StepOptions
              selectedOptionId={selectedOptionId}
              onSelectOption={(optId) => setSelectedOptionId(optId)}
            />
          )}

          {currentStep === 4 && (
            <StepDocuments
              documents={documents}
              onChange={(docs) => setDocuments(docs)}
            />
          )}

          {currentStep === 5 && (
            <StepApply
              summary={applicationSummary}
              onSubmitSuccess={() => setIsApplicationCompleted(true)}
            />
          )}
        </div>

        {/* Navigation Footer */}
        {!isApplicationCompleted && (
          <div className="flex items-center justify-between pt-4 border-t border-saarthi-border-subtle">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                'btn-outline inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-saarthi-border-subtle bg-saarthi-elevated text-xs font-normal text-saarthi-text-primary transition-colors',
                currentStep === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:border-saarthi-border-active hover:bg-saarthi-elevated/80'
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {/* Optional Reset Button */}
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  title="Reset to first step"
                  className="p-2 rounded-md text-saarthi-text-muted hover:text-saarthi-text-secondary hover:bg-saarthi-elevated transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Show Continue button on steps 0-4. Step 5 has Submit Application within StepApply */}
              {currentStep < STEP_LABELS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-normal hover:bg-saarthi-healthy/90 transition-colors shadow-sm"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default LoanJourneyPage;

