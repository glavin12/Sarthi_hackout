'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type LanguageCode = 'en' | 'hi' | 'gu';

export interface LanguageSwitcherProps {
  currentLang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  className?: string;
}

interface LanguageOption {
  code: LanguageCode;
  label: string;
  ariaLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'EN', ariaLabel: 'English' },
  { code: 'hi', label: 'हिं', ariaLabel: 'Hindi (हिंदी)' },
  { code: 'gu', label: 'ગુ', ariaLabel: 'Gujarati (ગુજરાતી)' },
];

/**
 * Language switcher component providing quick switching between English, Hindi, and Gujarati.
 * Displays three pill buttons with subtle divider borders and teal active highlights.
 */
export function LanguageSwitcher({
  currentLang,
  onLangChange,
  className,
}: LanguageSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Select language"
      className={cn(
        'inline-flex items-center gap-1 p-0.5 rounded-full bg-saarthi-card border border-saarthi-border-subtle',
        className
      )}
    >
      {LANGUAGES.map((lang, index) => {
        const isActive = currentLang === lang.code;
        return (
          <React.Fragment key={lang.code}>
            {index > 0 && (
              <span
                className="text-saarthi-text-muted/30 select-none text-xs pointer-events-none"
                aria-hidden="true"
              >
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => onLangChange(lang.code)}
              aria-pressed={isActive}
              aria-label={lang.ariaLabel}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full transition-colors duration-150 focus:outline-none select-none',
                isActive
                  ? 'bg-saarthi-healthy/15 text-saarthi-healthy font-normal'
                  : 'text-saarthi-text-muted hover:text-saarthi-text-secondary font-light'
              )}
            >
              {lang.label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
