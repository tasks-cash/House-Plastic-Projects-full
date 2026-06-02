"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  const stopLevelMonitor = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setLevel(0);
  }, []);

  const startLevelMonitor = useCallback((analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      setLevel(Math.min(1, avg / 128));
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setError(null);
  }, [audioUrl]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    stopLevelMonitor();
    setIsRecording(false);

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(audioBlob);
    }

    return new Promise((resolve) => {
      resolveStopRef.current = resolve;
      recorder.stop();
      mediaRecorderRef.current = null;
    });
  }, [audioBlob, stopLevelMonitor]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    clearRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      startLevelMonitor(analyser);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stopLevelMonitor();
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void audioContext.close();
        resolveStopRef.current?.(blob.size > 0 ? blob : null);
        resolveStopRef.current = null;
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      return true;
    } catch (err) {
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setError(denied ? "mic-denied" : "mic-unavailable");
      stopRecording();
      return false;
    }
  }, [clearRecording, startLevelMonitor, stopLevelMonitor, stopRecording]);

  useEffect(() => {
    return () => {
      stopLevelMonitor();
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, stopLevelMonitor]);

  return {
    isRecording,
    audioUrl,
    audioBlob,
    error,
    clearError,
    level,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
