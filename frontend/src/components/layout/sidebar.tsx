'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Target,
  X,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  activePath?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Loan Journey', href: '/loan-journey', icon: FileText },
  { label: 'Goals', href: '/goals', icon: Target },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ activePath, isOpen = false, onClose }: SidebarProps) {
  const currentPath = usePathname();
  const effectivePath = activePath ?? currentPath ?? '';

  const isItemActive = (href: string): boolean => {
    if (effectivePath === href) return true;
    if (href === '/dashboard' && (effectivePath === '/' || effectivePath === '')) return true;
    if (href !== '/' && href !== '/dashboard' && effectivePath.startsWith(href)) return true;
    return false;
  };

  const renderNavLinks = (items: NavItem[], sectionId: string) => (
    <ul className="space-y-2">
      {items.map((item) => {
        const active = isItemActive(item.href);
        const Icon = item.icon;

        return (
          <li key={item.href} className="relative">
            {active && (
              <motion.div
                layoutId={`active-nav-indicator-${sectionId}`}
                className="absolute inset-0 bg-saarthi-elevated/80 border border-saarthi-border-active rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <Link
              href={item.href}
              onClick={() => onClose?.()}
              className={`relative z-10 flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm transition-all duration-300 ${
                active
                  ? 'text-saarthi-text-primary font-medium'
                  : 'text-saarthi-text-secondary font-normal hover:text-saarthi-text-primary hover:bg-saarthi-elevated/30 hover:pl-4'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-300 ${
                  active ? 'text-saarthi-healthy drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]' : 'group-hover:text-saarthi-text-primary'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <motion.div 
                  layoutId={`active-left-border-${sectionId}`}
                  className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-saarthi-healthy rounded-r-md shadow-[0_0_8px_rgba(0,212,170,0.8)]"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Brand Header with Glow */}
      <div className="flex items-center justify-between px-2 mb-10">
        <Link href="/dashboard" onClick={() => onClose?.()} className="flex items-center gap-3 group relative">
          <div className="relative flex items-center justify-center w-6 h-6">
            <span className="absolute w-2 h-2 rounded-full bg-saarthi-healthy animate-pulse shadow-[0_0_12px_rgba(0,212,170,1)]" />
            <span className="absolute w-6 h-6 rounded-full border border-saarthi-healthy/30 animate-[spin_4s_linear_infinite]" />
          </div>
          <span className="text-sm font-light tracking-[0.35em] text-saarthi-text-primary uppercase select-none group-hover:text-white transition-colors">
            Saarthi
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md text-saarthi-text-secondary hover:text-saarthi-text-primary hover:bg-saarthi-elevated transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1">{renderNavLinks(MAIN_NAV_ITEMS, 'main')}</nav>
      <nav className="pt-6 border-t border-saarthi-border-subtle">{renderNavLinks(BOTTOM_NAV_ITEMS, 'bottom')}</nav>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-saarthi-bg/60 backdrop-blur-2xl border-r border-saarthi-border-subtle z-30 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-64 max-w-[80vw] h-full bg-saarthi-bg/90 backdrop-blur-2xl border-r border-saarthi-border-subtle shadow-2xl z-10 flex flex-col">
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

