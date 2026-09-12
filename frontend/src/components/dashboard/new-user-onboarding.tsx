"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Target, FileText, BadgeCheck } from "lucide-react";

export interface NewUserOnboardingProps {
  name: string;
}

/**
 * Shown to accounts that have zero transactions on record. Explicitly does NOT
 * fabricate a health score, savings, or EMI figures — a real bank would ask
 * the user to link an account first. We give three honest starter actions.
 */
export function NewUserOnboarding({ name }: NewUserOnboardingProps) {
  const steps = [
    {
      icon: MessageSquare,
      title: "Tell Saarthi about yourself",
      body: "A quick chat — job, monthly obligations, savings habits — so recommendations fit you.",
      href: "/chat",
      cta: "Start chatting",
    },
    {
      icon: FileText,
      title: "Explore lending options",
      body: "Walk through the loan journey to see the terms you'd qualify for.",
      href: "/loan-journey",
      cta: "Open loan journey",
    },
    {
      icon: Target,
      title: "Set your first savings goal",
      body: "Emergency fund, trip, down-payment — track progress from day one.",
      href: "/goals",
      cta: "Create a goal",
    },
  ];

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card p-6 border-l-2 border-l-saarthi-healthy"
      >
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-saarthi-healthy/15 text-saarthi-healthy flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-lg font-light tracking-tight">
              Welcome, {name} 👋
            </h2>
            <p className="text-xs font-light text-saarthi-text-secondary mt-1 max-w-lg">
              We don&rsquo;t have your transaction history yet, so we won&rsquo;t guess your finances. Do one of the three things below and Saarthi&rsquo;s guidance kicks in.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-light text-saarthi-text-muted">
              <BadgeCheck className="w-3.5 h-3.5 text-saarthi-healthy" />
              Your account is verified. KYC complete.
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.05 }}
              className="card p-4 flex flex-col justify-between h-full"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider text-saarthi-text-muted flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-saarthi-healthy" />
                  Step {i + 1}
                </span>
                <h3 className="text-sm font-normal mt-2">{s.title}</h3>
                <p className="text-xs font-light text-saarthi-text-secondary mt-1 leading-relaxed">
                  {s.body}
                </p>
              </div>
              <Link
                href={s.href}
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-saarthi-healthy text-saarthi-bg text-xs font-medium hover:bg-saarthi-healthy/90 transition-colors"
              >
                {s.cta}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default NewUserOnboarding;
