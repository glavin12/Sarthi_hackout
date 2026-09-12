'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';
import { ChatMessage, ChatResponse } from '@/types';
import { mockChatResponses } from '@/mocks/data';
import { sendChat } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MessageBubble } from '@/components/chat/message-bubble';
import { LanguageSwitcher, LanguageCode } from '@/components/chat/language-switcher';
import { MicButton } from '@/components/chat/mic-button';

export interface ChatPanelProps {
  className?: string;
  initialLang?: LanguageCode;
}

/**
 * Format current time into "HH:MM AM/PM" format.
 */
function getCurrentTimeString(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Main chat interface for Saarthi AI assistant.
 * Handles multilingual conversations, voice input toggle, real-time typing indicators,
 * guided journey cards, and context-aware responses.
 */
export function ChatPanel({
  className,
  initialLang = 'en',
}: ChatPanelProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLang);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Initialize with greeting in current language
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const greeting = mockChatResponses[`greeting_${initialLang}`] || mockChatResponses.greeting_en;
    return [
      {
        id: `init-${Date.now()}`,
        role: 'saarthi',
        text: greeting.reply_text,
        lang: initialLang,
        timestamp: getCurrentTimeString(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages list changes or typing indicator is toggled
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /**
   * Handle user language switch: update state and append greeting in the newly selected language.
   */
  const handleLangChange = (newLang: LanguageCode) => {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);

    const greetingKey = `greeting_${newLang}`;
    const greetingData = mockChatResponses[greetingKey] || mockChatResponses.greeting_en;

    const newGreetingMsg: ChatMessage = {
      id: `lang-change-${newLang}-${Date.now()}`,
      role: 'saarthi',
      text: greetingData.reply_text,
      lang: newLang,
      timestamp: getCurrentTimeString(),
    };

    setMessages((prev) => [...prev, newGreetingMsg]);
  };

  /**
   * Match user text to response intent based on keywords and current language.
   */
  const resolveBotResponse = (text: string, lang: LanguageCode): ChatResponse => {
    const lower = text.toLowerCase();

    if (lower.includes('loan') || lower.includes('emi') || lower.includes('ऋण') || lower.includes('લોન')) {
      const key = `loan_${lang}`;
      return mockChatResponses[key] || mockChatResponses.loan_en;
    }

    if (lower.includes('balance') || lower.includes('खाता') || lower.includes('બેલેન્સ') || lower.includes('શેષ')) {
      return mockChatResponses.balance_en;
    }

    const greetingKey = `greeting_${lang}`;
    return mockChatResponses[greetingKey] || mockChatResponses.greeting_en;
  };

  /**
   * Send a user message and trigger automated assistant response with typing delay.
   */
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      lang: currentLang,
      timestamp: getCurrentTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Call nlp-service; fall back to the mock resolver if it's unreachable.
    const appendReply = (responseData: ChatResponse) => {
      const saarthiMessage: ChatMessage = {
        id: `saarthi-${Date.now()}`,
        role: 'saarthi',
        text: responseData.reply_text,
        lang: currentLang,
        timestamp: getCurrentTimeString(),
        journey_step: responseData.journey_step,
      };
      setMessages((prev) => [...prev, saarthiMessage]);
      setIsTyping(false);
    };

    sendChat(query, currentLang)
      .then(appendReply)
      .catch((e) => {
        console.warn('NLP service unavailable, using mock response:', e);
        appendReply(resolveBotResponse(query, currentLang));
      });
  };

  /**
   * Handle Enter key to submit message.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Handle microphone toggle for simulated voice input.
   */
  const handleMicToggle = (listening: boolean) => {
    setIsListening(listening);
    if (listening) {
      // Simulate voice capture prompt after brief listening
      const timer = setTimeout(() => {
        setIsListening(false);
        const sampleVoiceQuery =
          currentLang === 'hi'
            ? 'मुझे होम लोन की जानकारी चाहिए'
            : currentLang === 'gu'
            ? 'મને હોમ લોનની માહિતી જોઈએ છે'
            : 'I would like to know about home loan options';
        setInputText(sampleVoiceQuery);
        inputRef.current?.focus();
      }, 2500);

      return () => clearTimeout(timer);
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-saarthi-bg overflow-hidden', className)}>
      {/* Top Bar Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-saarthi-border-subtle bg-saarthi-bg/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-saarthi-healthy" />
            <span className="absolute w-2 h-2 rounded-full bg-saarthi-healthy animate-ping opacity-60" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-normal text-saarthi-text-primary tracking-wide leading-none">
              Saarthi
            </span>
            <span className="text-[10px] font-light text-saarthi-text-muted mt-0.5">
              Personal Banking Intelligence
            </span>
          </div>
        </div>

        <LanguageSwitcher
          currentLang={currentLang}
          onLangChange={handleLangChange}
        />
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex w-full justify-start animate-slide-up">
            <div className="bg-saarthi-card border border-saarthi-border-subtle border-l-2 border-l-saarthi-healthy rounded-lg px-4 py-3 max-w-[80%] flex items-center gap-1.5 shadow-sm">
              <span
                className="w-1.5 h-1.5 rounded-full bg-saarthi-healthy animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-saarthi-healthy animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-saarthi-healthy animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}

        {/* Anchor to scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-saarthi-border-subtle bg-saarthi-bg p-3 shrink-0">
        {isListening && (
          <div className="mb-2 px-3 py-1.5 rounded-md bg-saarthi-card border border-saarthi-healthy/30 flex items-center justify-between text-xs text-saarthi-healthy font-light animate-fade-in">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-saarthi-healthy animate-ping" />
              Listening... Speak now
            </span>
            <button
              type="button"
              onClick={() => setIsListening(false)}
              className="text-[10px] text-saarthi-text-muted hover:text-saarthi-text-primary underline"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or speak..."
            className="flex-1 bg-saarthi-card border border-saarthi-border-subtle rounded-md px-3 py-2 text-sm font-light text-saarthi-text-primary placeholder:text-saarthi-text-muted focus:outline-none focus:border-saarthi-border-active transition-colors"
          />

          <MicButton
            isListening={isListening}
            onToggle={handleMicToggle}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            aria-label="Send message"
            className="p-2 rounded-md text-saarthi-healthy hover:bg-saarthi-healthy/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none"
          >
            <SendHorizontal className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
