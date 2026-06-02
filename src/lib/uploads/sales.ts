export const SALES_UPLOAD_DIR = "public/uploads/sales";
export const SALES_PUBLIC_PREFIX = "/uploads/sales";
export const MAX_SALES_MEDIA_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_SALES_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_SALES_VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export const ALLOWED_SALES_MEDIA_MIME = new Set([
  ...ALLOWED_SALES_IMAGE_MIME,
  ...ALLOWED_SALES_VIDEO_MIME,
]);

export type SalesMediaType = "image" | "video";

export function salesMediaTypeFromMime(mimeType: string): SalesMediaType | null {
  if (ALLOWED_SALES_IMAGE_MIME.has(mimeType)) return "image";
  if (ALLOWED_SALES_VIDEO_MIME.has(mimeType)) return "video";
  return null;
}
