import React from 'react';
import { PageShell } from '@/components/layout/page-shell';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <PageShell>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-saarthi-text-primary mb-2">Help & Support</h1>
          <p className="text-sm font-light text-saarthi-text-secondary">We're here to help you navigate your financial journey.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="text-lg font-normal mb-2 text-saarthi-healthy">Talk to Saarthi</h2>
            <p className="text-sm font-light text-saarthi-text-secondary mb-6">
              Our AI assistant is available 24/7 to answer your questions and guide you through your finances.
            </p>
            <Link href="/chat" className="btn-primary">
              Start Chat
            </Link>
          </div>

          <div className="card">
            <h2 className="text-lg font-normal mb-2 text-saarthi-text-primary">Contact Human Advisor</h2>
            <p className="text-sm font-light text-saarthi-text-secondary mb-6">
              Need to speak with a human? Our banking advisors are available Mon-Fri, 9AM to 6PM.
            </p>
            <button className="btn-outline">
              Request Callback
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
