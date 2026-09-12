'use client';

import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MicButtonProps {
  /** Optional controlled listening state */
  isListening?: boolean;
  /** Callback fired when the listening state toggles */
  onToggle?: (listening: boolean) => void;
  /** Optional container class name */
  className?: string;
}

/**
 * Voice input microphone button.
 * Toggles an active listening state with an animated ping pulse ring and teal color transition.
 */
export function MicButton({
  isListening: controlledListening,
  onToggle,
  className,
}: MicButtonProps) {
  const [internalListening, setInternalListening] = useState(false);

  const isControlled = controlledListening !== undefined;
  const isListening = isControlled ? controlledListening : internalListening;

  const handleClick = () => {
    const next = !isListening;
    if (!isControlled) {
      setInternalListening(next);
    }
    onToggle?.(next);
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Outer pulsing ring when listening */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full bg-saarthi-healthy/40 animate-ping pointer-events-none"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
        className={cn(
          'relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none',
          isListening
            ? 'bg-saarthi-healthy text-saarthi-bg shadow-[0_0_16px_rgba(0,212,170,0.4)]'
            : 'bg-saarthi-healthy/15 text-saarthi-healthy hover:bg-saarthi-healthy/25'
        )}
      >
        <Mic className="w-4 h-4 stroke-[2]" />
      </button>
    </div>
  );
}

export default MicButton;
