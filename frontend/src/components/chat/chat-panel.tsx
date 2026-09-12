'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SendHorizontal } from 'lucide-react';
import { ChatMessage, ChatResponse } from '@/types';
import { mockChatResponses } from '@/mocks/data';
import { cn } from '@/lib/utils';
import { MessageBubble } from '@/components/chat/message-bubble';
import { LanguageSwitcher, LanguageCode } from '@/components/chat/language-switcher';
import { MicButton } from '@/components/chat/mic-button';
import { sendChatMessage, currentCustomerId } from '@/lib/api';
import { useSpeechRecognition } from '@/lib/speech';

const LANG_BCP47: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
};

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
  const [isLive, setIsLive] = useState(false);

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

  const speech = useSpeechRecognition({
    lang: LANG_BCP47[currentLang],
    onFinal: (text) => {
      // Push the final transcript into the input so the user can review or
      // send. Auto-send would be surprising after a mis-hear.
      setInputText((prev) => (prev ? `${prev} ${text}` : text));
      inputRef.current?.focus();
    },
  });

  // Scroll to bottom whenever messages list changes or typing indicator is toggled
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /**
   * Handle user language switch: RESET the chat (a language change means a
   * new conversation, not a mixed-script transcript) and open with a greeting
   * in the newly selected language.
   */
  const handleLangChange = (newLang: LanguageCode) => {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);
    speech.stop();
    const greetingKey = `greeting_${newLang}`;
    const greetingData = mockChatResponses[greetingKey] || mockChatResponses.greeting_en;
    setMessages([
      {
        id: `init-${newLang}-${Date.now()}`,
        role: 'saarthi',
        text: greetingData.reply_text,
        lang: newLang,
        timestamp: getCurrentTimeString(),
      },
    ]);
  };

  /**
   * Detect the script of the user's message so we can reply in the same
   * language even if the UI is set to English but the user types/speaks
   * Hindi or Gujarati.
   */
  const detectLangFromText = (text: string, fallback: LanguageCode): LanguageCode => {
    for (const ch of text) {
      const c = ch.charCodeAt(0);
      if (c >= 0x0900 && c <= 0x097F) return 'hi';
      if (c >= 0x0A80 && c <= 0x0AFF) return 'gu';
    }
    return fallback;
  };

  /**
   * Rule-based intent + polite unknown fallback in the SAME language the
   * user wrote in. Used when the NLP backend is unreachable.
   */
  const resolveBotResponse = (text: string, uiLang: LanguageCode): ChatResponse => {
    const lang = detectLangFromText(text, uiLang);
    const lower = text.toLowerCase();
    const pick = (key: string) => mockChatResponses[key] || mockChatResponses[`unknown_${lang}`] || mockChatResponses.unknown_en;

    const loanTerms = ['loan', 'emi', 'लोन', 'ऋण', 'क़र्ज़', 'कर्ज', 'લોન', 'ઇએમઆઈ'];
    const balanceTerms = ['balance', 'account', 'बैलेंस', 'खाता', 'खाते', 'शेष', 'બેલેન્સ', 'ખાતું', 'ખાતા', 'શેષ'];
    const kycTerms = ['kyc', 'आधार', 'पैन', 'आइडी', 'आईडी', 'આધાર', 'પાન', 'આઈડી', 'ઓળખ'];
    const complaintTerms = ['complaint', 'fraud', 'issue', 'problem', 'शिकायत', 'फ्रॉड', 'धोखा', 'ફરિયાદ', 'ફ્રોડ', 'છેતરપિંડી'];
    const goalTerms = ['goal', 'save', 'saving', 'बचत', 'लक्ष्य', 'बचाना', 'બચત', 'લક્ષ્ય', 'બચાવવું'];
    const greetTerms = ['hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'हैलो', 'નમસ્તે', 'હેલો', 'કેમ છો'];

    const hit = (terms: string[]) => terms.some((t) => lower.includes(t.toLowerCase()));

    if (hit(loanTerms))       return pick(`loan_${lang}`);
    if (hit(balanceTerms))    return pick(`balance_${lang}`);
    if (hit(kycTerms))        return pick(`kyc_${lang}`);
    if (hit(complaintTerms))  return pick(`complaint_${lang}`);
    if (hit(goalTerms))       return pick(`goal_${lang}`);
    if (hit(greetTerms))      return pick(`greeting_${lang}`);

    // Nothing matched — polite "don't know" in the detected language.
    return mockChatResponses[`unknown_${lang}`] || mockChatResponses.unknown_en;
  };

  /**
   * Send a user message and trigger automated assistant response with typing delay.
   */
  const handleSendMessage = async (textToSend?: string) => {
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

    try {
      // Try real NLP service
      const apiResponse = await sendChatMessage(Number(currentCustomerId()), query, currentLang);
      setIsLive(true);
      
      const saarthiMessage: ChatMessage = {
        id: `saarthi-${Date.now()}`,
        role: 'saarthi',
        text: apiResponse.reply_text,
        lang: apiResponse.lang_detected || currentLang,
        timestamp: getCurrentTimeString(),
        journey_step: apiResponse.journey_step != null ? {
          step: apiResponse.journey_step,
          total: 6,
          label: apiResponse.requires || 'In progress',
          status: 'active' as const,
        } : undefined,
      };

      setMessages((prev) => [...prev, saarthiMessage]);
    } catch (err) {
      console.warn('NLP service unreachable, using mock:', err);
      setIsLive(false);
      
      // Fallback to mock
      await new Promise(resolve => setTimeout(resolve, 800));
      const responseData = resolveBotResponse(query, currentLang);
      const saarthiMessage: ChatMessage = {
        id: `saarthi-${Date.now()}`,
        role: 'saarthi',
        text: responseData.reply_text,
        lang: currentLang,
        timestamp: getCurrentTimeString(),
        journey_step: responseData.journey_step,
      };
      setMessages((prev) => [...prev, saarthiMessage]);
    } finally {
      setIsTyping(false);
    }
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
   * Toggle real speech recognition. Uses the current UI language to pick
   * hi-IN / gu-IN / en-IN. If the browser doesn't support it, MicButton is
   * hidden entirely (see render).
   */
  const handleMicToggle = (shouldListen: boolean) => {
    if (shouldListen) speech.start();
    else speech.stop();
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
        {speech.listening && (
          <div className="mb-2 px-3 py-1.5 rounded-md bg-saarthi-card border border-saarthi-healthy/30 flex items-center justify-between text-xs text-saarthi-healthy font-light animate-fade-in">
            <span className="inline-flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-saarthi-healthy animate-ping shrink-0" />
              <span className="truncate">
                {speech.interim
                  ? speech.interim
                  : `Listening in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'gu' ? 'Gujarati' : 'English'}...`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => speech.stop()}
              className="text-[10px] text-saarthi-text-muted hover:text-saarthi-text-primary underline shrink-0 ml-2"
            >
              Cancel
            </button>
          </div>
        )}

        {speech.error && !speech.listening && (
          <div className="mb-2 px-3 py-1.5 rounded-md bg-saarthi-stressed/10 border border-saarthi-stressed/30 text-xs text-saarthi-stressed font-light animate-fade-in">
            {speech.error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={speech.supported ? "Type or tap the mic to speak..." : "Type your message..."}
            className="flex-1 bg-saarthi-card border border-saarthi-border-subtle rounded-md px-3 py-2 text-sm font-light text-saarthi-text-primary placeholder:text-saarthi-text-muted focus:outline-none focus:border-saarthi-border-active transition-colors"
          />

          {speech.supported && (
            <MicButton
              isListening={speech.listening}
              onToggle={handleMicToggle}
            />
          )}

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
