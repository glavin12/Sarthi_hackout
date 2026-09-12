'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { ChatMessage, JourneyStep } from '@/types';
import { cn } from '@/lib/utils';

export interface JourneyStepCardProps {
  step: JourneyStep;
}

/**
 * JourneyStepCard renders progress inside guided multi-step banking journeys.
 * Displays step index, total steps, step label, a teal progress bar,
 * and a completion checkmark.
 */
export function JourneyStepCard({ step }: JourneyStepCardProps) {
  const isCompleted = step.status === 'completed';
  const progressPercent = Math.min(100, Math.max(0, (step.step / step.total) * 100));

  return (
    <div className="mt-2.5 p-3 rounded-md bg-saarthi-bg/70 border border-saarthi-border-subtle space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-saarthi-healthy uppercase tracking-wider">
            Step {step.step} of {step.total}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] text-saarthi-healthy font-light">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Completed</span>
            </span>
          )}
        </div>
      </div>

      <div className="text-xs font-light text-saarthi-text-primary leading-snug">
        {step.label}
      </div>

      <div className="w-full h-1 bg-saarthi-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-saarthi-healthy rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Format timestamp string into clean human-readable time format.
 */
function formatMessageTime(timestamp: string): string {
  if (!timestamp) return '';
  // If already formatted like "10:45 AM"
  if (timestamp.includes(':') && !timestamp.includes('T') && !timestamp.includes('-')) {
    return timestamp;
  }
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timestamp;
  }
}

/**
 * Chat message bubble component.
 * Renders Saarthi assistant messages (left-aligned with teal accent border)
 * and user messages (right-aligned in elevated container), with support for
 * interactive journey step cards.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const formattedTime = formatMessageTime(message.timestamp);

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3.5 animate-slide-up transition-all',
          isUser
            ? 'bg-saarthi-elevated'
            : 'bg-saarthi-card border border-saarthi-border-subtle border-l-2 border-l-saarthi-healthy'
        )}
      >
        <p className="text-sm font-light text-saarthi-text-primary whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        {message.journey_step && (
          <JourneyStepCard step={message.journey_step} />
        )}

        {formattedTime && (
          <div
            className={cn(
              'text-[10px] text-saarthi-text-muted mt-1 select-none',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
