"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const VOICE_LANGUAGES = [
  { value: "ar-DZ", label: "العربية (Algeria)" },
  { value: "en-US", label: "English (US)" },
] as const;

export type VoiceLang = (typeof VOICE_LANGUAGES)[number]["value"];

export function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void
) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [lang, setLang] = useState<VoiceLang>("en-US");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const clearError = useCallback(() => {
    setRecordingError(null);
  }, []);

  const stopRecording = useCallback(() => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  const attachRecognition = useCallback(
    (Ctor: SpeechRecognitionConstructor) => {
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalChunk += transcript;
          } else {
            interim += transcript;
          }
        }

        if (finalChunk.trim()) {
          onResultRef.current(finalChunk, true);
        } else if (interim.trim()) {
          onResultRef.current(interim, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "aborted") {
          setRecordingError(
            event.error === "not-allowed" ? "mic-denied" : "speech-failed"
          );
        }
        listeningRef.current = false;
        recognitionRef.current = null;
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (!listeningRef.current) {
          recognitionRef.current = null;
          setIsRecording(false);
          return;
        }

        try {
          recognition.start();
        } catch {
          listeningRef.current = false;
          recognitionRef.current = null;
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    },
    [lang]
  );

  const startRecording = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    setRecordingError(null);
    listeningRef.current = true;

    const recognition = attachRecognition(Ctor);

    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      listeningRef.current = false;
      setRecordingError("Could not start voice recognition.");
      recognitionRef.current = null;
      setIsRecording(false);
    }
  }, [attachRecognition]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return {
    supported,
    lang,
    setLang,
    isRecording,
    recordingError,
    clearError,
    startRecording,
    stopRecording,
  };
}

/** Append transcript to existing text (space-separated). */
export function appendToText(current: string, transcript: string): string {
  const trimmed = transcript.trim();
  if (!trimmed) return current;
  const separator = current.trim().length > 0 ? " " : "";
  return current + separator + trimmed;
}
