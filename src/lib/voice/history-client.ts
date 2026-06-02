"use client";

import { apiPost, apiUploadAudio } from "@/lib/api-client";
import type { VoiceLang } from "@/hooks/useSpeechRecognition";

export interface VoiceHistoryEntry {
  id: string;
  page: string;
  fieldName: string;
  recognizedText: string;
  audioFile: string;
  language: string;
  createdAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  page: string;
  source: "text" | "voice";
  createdAt: string;
}

export interface TextHistoryEntry {
  id: string;
  page: string;
  fieldName: string;
  text: string;
  createdAt: string;
}

export async function saveVoiceHistory(params: {
  page: string;
  fieldName: string;
  recognizedText: string;
  audioFile: string;
  language: VoiceLang;
}): Promise<void> {
  try {
    await apiPost("/api/voice/history", params);
  } catch (error) {
    console.warn("[voice] failed to save voice history:", error);
  }
}

export async function saveSearchHistory(params: {
  query: string;
  page: string;
  source?: "text" | "voice";
}): Promise<void> {
  try {
    await apiPost("/api/search/history", params);
  } catch (error) {
    console.warn("[voice] failed to save search history:", error);
  }
}

export async function saveTextHistory(params: {
  page: string;
  fieldName: string;
  text: string;
}): Promise<void> {
  try {
    await apiPost("/api/text/history", params);
  } catch (error) {
    console.warn("[voice] failed to save text history:", error);
  }
}

export async function uploadVoiceAudio(blob: Blob): Promise<string> {
  const ext = blob.type.includes("webm") ? "webm" : blob.type.includes("wav") ? "wav" : "webm";
  const result = await apiUploadAudio(blob, `recording.${ext}`);
  return result.audioFile;
}
