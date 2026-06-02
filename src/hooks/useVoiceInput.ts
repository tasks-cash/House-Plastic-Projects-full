"use client";

import {
  appendToText,
  useSpeechRecognition,
  type VoiceLang,
} from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/useToast";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import {
  isMicPermissionError,
  notifyMicPermissionDenied,
  notifyVoiceUnsupported,
} from "@/lib/voice/notify";
import {
  saveSearchHistory,
  saveTextHistory,
  saveVoiceHistory,
  uploadVoiceAudio,
} from "@/lib/voice/history-client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceInputOptions {
  page: string;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  trackTextHistory?: boolean;
}

function isPermissionErrorCode(message: string | null | undefined): boolean {
  if (!message) return false;
  return message === "mic-denied" || isMicPermissionError(message);
}

export function useVoiceInput({
  page,
  fieldName,
  value,
  onChange,
  trackTextHistory = true,
}: UseVoiceInputOptions) {
  const { showToast } = useToast();
  const committedRef = useRef(value);
  const sessionTranscriptRef = useRef("");
  const [interimText, setInterimText] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const recorder = useVoiceRecorder();

  const applyValue = useCallback(
    (next: string) => {
      committedRef.current = next;
      onChange(next);
    },
    [onChange]
  );

  const handleSpeechAppend = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isFinal) {
        const next = appendToText(committedRef.current, transcript);
        sessionTranscriptRef.current = appendToText(
          sessionTranscriptRef.current,
          transcript
        );
        applyValue(next);
        setInterimText("");
        return;
      }

      setInterimText(transcript);
      const separator = committedRef.current.trim() ? " " : "";
      onChange(committedRef.current + separator + transcript);
    },
    [applyValue, onChange]
  );

  const speech = useSpeechRecognition((text, isFinal) =>
    handleSpeechAppend(text, isFinal)
  );

  const handleVoiceFailure = useCallback(
    (error: string | null | undefined) => {
      if (!error) return;
      if (isPermissionErrorCode(error)) {
        notifyMicPermissionDenied(showToast);
      }
      speech.clearError();
      recorder.clearError();
    },
    [recorder, showToast, speech]
  );

  useEffect(() => {
    handleVoiceFailure(speech.recordingError);
  }, [speech.recordingError, handleVoiceFailure]);

  useEffect(() => {
    handleVoiceFailure(recorder.error);
  }, [recorder.error, handleVoiceFailure]);

  const startVoice = useCallback(async () => {
    if (speech.supported === false) {
      notifyVoiceUnsupported(showToast);
      return;
    }

    sessionTranscriptRef.current = "";
    committedRef.current = value;
    setInterimText("");
    setIsVoiceActive(true);

    const micReady = await recorder.startRecording();
    if (!micReady) {
      setIsVoiceActive(false);
      return;
    }

    speech.startRecording();
  }, [recorder, showToast, speech, value]);

  const stopVoice = useCallback(async () => {
    speech.stopRecording();
    const blob = await recorder.stopRecording();
    setIsVoiceActive(false);
    setInterimText("");

    const finalText = sessionTranscriptRef.current.trim() || value.trim();
    if (!finalText && !blob) return;

    setSaving(true);
    try {
      let audioFile = "";
      if (blob && blob.size > 0) {
        audioFile = await uploadVoiceAudio(blob);
      }

      if (finalText || audioFile) {
        await saveVoiceHistory({
          page,
          fieldName,
          recognizedText: finalText,
          audioFile,
          language: speech.lang,
        });
      }
    } finally {
      setSaving(false);
    }
  }, [fieldName, page, recorder, speech, value]);

  const toggleVoice = useCallback(async () => {
    if (speech.supported === false) {
      notifyVoiceUnsupported(showToast);
      return;
    }

    if (isVoiceActive || speech.isRecording || recorder.isRecording) {
      await stopVoice();
    } else {
      await startVoice();
    }
  }, [
    isVoiceActive,
    recorder.isRecording,
    showToast,
    speech.isRecording,
    speech.supported,
    startVoice,
    stopVoice,
  ]);

  const persistTextHistory = useCallback(async () => {
    const text = value.trim();
    if (!trackTextHistory || !text) return;
    await saveTextHistory({ page, fieldName, text });
  }, [fieldName, page, trackTextHistory, value]);

  const persistSearchHistory = useCallback(
    async (query: string, source: "text" | "voice" = "text") => {
      const trimmed = query.trim();
      if (!trimmed) return;
      await saveSearchHistory({ query: trimmed, page, source });
    },
    [page]
  );

  return {
    lang: speech.lang as VoiceLang,
    setLang: speech.setLang,
    supported: speech.supported,
    isVoiceActive: isVoiceActive || speech.isRecording || recorder.isRecording,
    isSaving: saving,
    interimText,
    audioUrl: recorder.audioUrl,
    audioBlob: recorder.audioBlob,
    level: recorder.level,
    toggleVoice,
    startVoice,
    stopVoice,
    clearAudio: recorder.clearRecording,
    persistTextHistory,
    persistSearchHistory,
  };
}
