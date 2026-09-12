import React from 'react';
import { PageShell } from '@/components/layout/page-shell';

export default function SettingsPage() {
  return (
    <PageShell>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-saarthi-text-primary mb-2">Settings</h1>
          <p className="text-sm font-light text-saarthi-text-secondary">Manage your Saarthi account and preferences.</p>
        </div>
        
        <div className="card space-y-6">
          <div className="border-b border-saarthi-border-subtle pb-4">
            <h2 className="text-lg font-normal mb-1">Profile</h2>
            <p className="text-sm font-light text-saarthi-text-secondary">Ramesh Kumar</p>
            <p className="text-xs text-saarthi-text-muted mt-1">KYC Status: Verified</p>
          </div>
          
          <div className="border-b border-saarthi-border-subtle pb-4">
            <h2 className="text-lg font-normal mb-1">Language Preferences</h2>
            <p className="text-sm font-light text-saarthi-text-secondary">Use the top bar toggle or chat to switch languages.</p>
          </div>

          <div>
            <h2 className="text-lg font-normal mb-1">Notifications</h2>
            <p className="text-sm font-light text-saarthi-text-secondary">Push notifications are currently enabled for alerts.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
