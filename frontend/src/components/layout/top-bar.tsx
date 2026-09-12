'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export type LanguageCode = 'en' | 'hi' | 'gu';

export interface TopBarProps {
  /** Callback fired when user taps the hamburger menu button */
  onMenuClick: () => void;
  /** Currently selected language */
  currentLang: LanguageCode;
  /** Callback fired when user switches the language */
  onLangChange: (lang: LanguageCode) => void;
}

interface LanguageOption {
  code: LanguageCode;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'gu', label: 'ગુ' },
];

/**
 * TopBar Component
 *
 * Mobile header bar shown on small and medium screens (lg:hidden).
 * Displays a hamburger toggle button, centered Saarthi brand identity,
 * and a compact tri-language switcher pill group.
 */
export function TopBar({ onMenuClick, currentLang, onLangChange }: TopBarProps) {
  return (
    <header className="lg:hidden h-14 w-full bg-saarthi-bg border-b border-saarthi-border-subtle flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left: Hamburger Menu Button */}
      <div className="flex items-center min-w-[72px]">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-2 -ml-2 rounded-md text-saarthi-text-secondary hover:text-saarthi-text-primary hover:bg-saarthi-elevated transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Brand Logo */}
      <div className="flex items-center gap-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-saarthi-healthy shrink-0" />
        <span className="text-sm font-light tracking-[0.3em] text-saarthi-text-primary uppercase">
          Saarthi
        </span>
      </div>

      {/* Right: Language Switcher Pills */}
      <div
        className="flex items-center p-0.5 rounded-full bg-saarthi-card border border-saarthi-border-subtle"
        role="radiogroup"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onLangChange(lang.code)}
              className={`px-2 py-0.5 text-xs rounded-full transition-all duration-150 ${
                isActive
                  ? 'bg-saarthi-elevated text-saarthi-text-primary border border-saarthi-border-active shadow-sm font-medium'
                  : 'text-saarthi-text-muted hover:text-saarthi-text-secondary font-normal border border-transparent'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

export default TopBar;
