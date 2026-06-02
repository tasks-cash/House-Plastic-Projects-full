import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import {
  ALLOWED_AUDIO_MIME,
  AUDIO_PUBLIC_PREFIX,
  AUDIO_UPLOAD_DIR,
  MAX_AUDIO_BYTES,
} from "@/lib/voice/constants";
import { sanitizeAudioFilename } from "@/lib/voice/sanitize";

export const POST = requireAuth(async (request: NextRequest, _context, session) => {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data", { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return jsonError("Audio file is required", { status: 400 });
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return jsonError(`File too large. Maximum size is ${MAX_AUDIO_BYTES / (1024 * 1024)}MB`, {
      status: 413,
    });
  }

  const mimeType = file.type || "audio/webm";
  if (!ALLOWED_AUDIO_MIME.has(mimeType)) {
    return jsonError("Unsupported audio format. Use webm, mp3, or wav.", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeAudioFilename(file.name || "recording.webm", mimeType);
  const uploadDir = path.join(process.cwd(), AUDIO_UPLOAD_DIR);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const audioFile = `${AUDIO_PUBLIC_PREFIX}/${filename}`;

  return jsonSuccess(
    {
      audioFile,
      filename,
      userId: session.userId,
    },
    { status: 201 }
  );
});
