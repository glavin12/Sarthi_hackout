'use client';

import React from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { ChatPanel } from '@/components/chat/chat-panel';

/**
 * ChatPage renders the dedicated Saarthi conversational assistant screen.
 * Wrapped in PageShell with full viewport minus navigation height.
 */
function ChatPage() {
  return (
    <PageShell>
      <div className="h-[calc(100vh-theme(spacing.14))] flex flex-col">
        <ChatPanel className="h-full flex flex-col" />
      </div>
    </PageShell>
  );
}

export default ChatPage;

