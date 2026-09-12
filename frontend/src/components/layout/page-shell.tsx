'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { TopBar, LanguageCode } from './top-bar';
import { useAuth } from '@/lib/auth';

export interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

/**
 * Hook to access and update the current interface language in any child component
 */
export const useLanguage = () => useContext(LanguageContext);

export interface PageShellProps {
  children: React.ReactNode;
  /** Optional initial language, defaults to 'en' */
  initialLang?: LanguageCode;
}

/**
 * PageShell Component
 *
 * Core layout component for Saarthi pages.
 * Combines responsive Sidebar, mobile TopBar, and the main scrollable viewport.
 * Manages mobile drawer toggle state, current language context, and active navigation path.
 */
export function PageShell({ children, initialLang = 'en' }: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang);
  const activePath = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) router.replace('/welcome');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-saarthi-bg flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-saarthi-healthy animate-pulse" />
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language: currentLang, setLanguage: setCurrentLang }}>
      <div className="min-h-screen bg-saarthi-bg text-saarthi-text-primary flex flex-col lg:flex-row">
        {/* Sidebar Component: Persistent desktop navigation + slide-out mobile drawer */}
        <Sidebar
          activePath={activePath}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Top Bar (lg:hidden) */}
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            currentLang={currentLang}
            onLangChange={setCurrentLang}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-6 lg:p-8 bg-saarthi-bg min-h-[calc(100vh-3.5rem)] lg:min-h-screen overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </LanguageContext.Provider>
  );
}

export default PageShell;
