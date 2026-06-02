import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { sanitizeMediaFilename } from "@/lib/uploads/sanitize-media";
import {
  ALLOWED_SALES_MEDIA_MIME,
  MAX_SALES_MEDIA_BYTES,
  SALES_PUBLIC_PREFIX,
  SALES_UPLOAD_DIR,
  salesMediaTypeFromMime,
} from "@/lib/uploads/sales";

export const POST = requireAuth(async (request: NextRequest, _context, session) => {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form data", { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return jsonError("Media file is required", { status: 400 });
  }

  if (file.size > MAX_SALES_MEDIA_BYTES) {
    return jsonError(`File too large. Maximum size is ${MAX_SALES_MEDIA_BYTES / (1024 * 1024)}MB`, {
      status: 413,
    });
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_SALES_MEDIA_MIME.has(mimeType)) {
    return jsonError("Unsupported format. Use jpg, png, webp, mp4, mov, or webm.", {
      status: 400,
    });
  }

  const mediaType = salesMediaTypeFromMime(mimeType);
  if (!mediaType) {
    return jsonError("Unsupported media type", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeMediaFilename(file.name || "proof.bin", mimeType);
  const uploadDir = path.join(process.cwd(), SALES_UPLOAD_DIR);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `${SALES_PUBLIC_PREFIX}/${filename}`;
  const uploadedAt = new Date().toISOString();

  return jsonSuccess(
    {
      url,
      type: mediaType,
      filename,
      uploadedAt,
      userId: session.userId,
    },
    { status: 201 }
  );
});
