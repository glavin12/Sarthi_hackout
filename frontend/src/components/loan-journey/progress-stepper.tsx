'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

export interface ProgressStepperProps {
  currentStep: number;
  steps: StepItem[];
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

/**
 * Horizontal progress stepper component for the guided loan journey.
 * Follows the Rho.co-inspired light-weight aesthetic.
 */
export function ProgressStepper({
  currentStep,
  steps,
  className,
  onStepClick,
}: ProgressStepperProps) {
  return (
    <div className={cn('flex items-center gap-0 w-full', className)}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isActive = step.status === 'active';
        const isPending = step.status === 'pending';
        const isLast = idx === steps.length - 1;
        const isClickable = onStepClick && (isCompleted || idx <= currentStep);

        return (
          <React.Fragment key={step.label || idx}>
            <div
              className={cn(
                'flex flex-col items-center relative select-none',
                isClickable && 'cursor-pointer group'
              )}
              onClick={() => isClickable && onStepClick?.(idx)}
              role={onStepClick ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 shrink-0',
                  isCompleted && 'bg-saarthi-healthy/20 text-saarthi-healthy',
                  isActive && 'bg-saarthi-healthy text-saarthi-bg font-medium shadow-sm ring-2 ring-saarthi-healthy/20',
                  isPending && 'bg-saarthi-elevated text-saarthi-text-muted border border-saarthi-border-subtle'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="font-light">{idx + 1}</span>
                )}
              </div>

              {/* Step Label below circle */}
              <span
                className={cn(
                  'text-[10px] mt-1.5 text-center max-w-[60px] leading-tight transition-colors line-clamp-2',
                  isActive
                    ? 'text-saarthi-text-primary font-medium'
                    : 'text-saarthi-text-muted font-light',
                  isClickable && 'group-hover:text-saarthi-text-primary'
                )}
                title={step.label}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between circles (aligned with circle center at 14px) */}
            {!isLast && (
              <div
                className={cn(
                  'h-[1px] flex-1 mx-1 self-start mt-3.5 transition-colors duration-200',
                  isCompleted ? 'bg-saarthi-healthy/40' : 'bg-saarthi-border-subtle'
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressStepper;
