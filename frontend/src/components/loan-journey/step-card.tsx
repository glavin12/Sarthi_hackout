'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StepCardProps {
  title: string;
  description: string;
  children: ReactNode;
  stepInfo?: string;
  className?: string;
}

/**
 * StepCard Component
 *
 * Generic container card for loan journey steps with consistent padding,
 * border styling, typography hierarchy, and entry animation.
 */
export function StepCard({
  title,
  description,
  children,
  stepInfo,
  className,
}: StepCardProps) {
  return (
    <div
      className={cn(
        'bg-saarthi-card border border-saarthi-border-subtle rounded-lg p-5 animate-fade-in transition-all',
        className
      )}
    >
      {/* Optional step indicator badge / label */}
      {stepInfo && (
        <div className="text-[10px] uppercase tracking-wider text-saarthi-text-muted mb-2 font-medium">
          {stepInfo}
        </div>
      )}

      {/* Step Title */}
      <h2 className="text-base font-normal text-saarthi-text-primary mb-1 tracking-tight">
        {title}
      </h2>

      {/* Step Description */}
      <p className="text-sm font-light text-saarthi-text-secondary mb-4 leading-relaxed">
        {description}
      </p>

      {/* Step Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}

export default StepCard;
