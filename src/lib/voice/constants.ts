export const AUDIO_UPLOAD_DIR = "public/uploads/audio";
export const AUDIO_PUBLIC_PREFIX = "/uploads/audio";

export const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_AUDIO_MIME = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
]);

export const ALLOWED_AUDIO_EXT = new Set(["webm", "mp3", "wav"]);

export const VOICE_LANG_VALUES = ["ar-DZ", "en-US"] as const;
