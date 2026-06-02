import { ALLOWED_AUDIO_EXT } from "@/lib/voice/constants";
import { randomBytes } from "crypto";

export function sanitizeAudioFilename(originalName: string, mimeType: string): string {
  const extFromName = originalName.split(".").pop()?.toLowerCase() ?? "";
  const extFromMime =
    mimeType.includes("webm") ? "webm" : mimeType.includes("wav") ? "wav" : mimeType.includes("mpeg") || mimeType.includes("mp3") ? "mp3" : "";

  let ext = ALLOWED_AUDIO_EXT.has(extFromName) ? extFromName : extFromMime;
  if (!ALLOWED_AUDIO_EXT.has(ext)) {
    ext = "webm";
  }

  const token = randomBytes(8).toString("hex");
  return `voice-${Date.now()}-${token}.${ext}`;
}

export function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}
