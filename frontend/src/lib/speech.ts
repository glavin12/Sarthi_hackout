"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API wrapper — no npm dependency, works in Chrome/Edge/Android
// Chrome. `lang` accepts BCP-47 codes: en-IN, hi-IN, gu-IN.
// Firefox has no SpeechRecognition; Safari's is partial. Callers should
// respect `supported` and hide the mic when false.

// Chrome exposes it as webkitSpeechRecognition; Safari sometimes both.
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) ?? null;
}

export interface UseSpeechRecognitionOpts {
  /** BCP-47 language, e.g. "en-IN". */
  lang: string;
  /** Called with the final transcript when recognition ends. */
  onFinal?: (text: string) => void;
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  listening: boolean;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export function useSpeechRecognition(opts: UseSpeechRecognitionOpts): UseSpeechRecognitionResult {
  const { lang, onFinal } = opts;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalRef = useRef<string>("");

  useEffect(() => {
    setSupported(!!getCtor());
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    setError(null);
    setInterim("");
    finalRef.current = "";

    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event: any) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalRef.current += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(interimText);
    };
    rec.onerror = (e: any) => {
      const code = e?.error || "unknown";
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone permission was blocked. Please allow it in your browser."
          : code === "no-speech"
            ? "Didn't catch that. Try again."
            : code === "audio-capture"
              ? "No microphone detected."
              : `Voice error: ${code}`,
      );
    };
    rec.onend = () => {
      setListening(false);
      const final = finalRef.current.trim();
      if (final && onFinal) onFinal(final);
      setInterim("");
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Voice input couldn't start.");
      setListening(false);
    }
  }, [lang, onFinal]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      try { recRef.current?.abort(); } catch { /* noop */ }
    };
  }, []);

  return { supported, listening, interim, error, start, stop };
}
