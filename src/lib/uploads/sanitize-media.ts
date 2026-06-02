import { randomBytes } from "crypto";

const SAFE_EXT = new Set(["jpg", "jpeg", "png", "webp", "mp4", "mov", "webm"]);

export function sanitizeMediaFilename(originalName: string, mimeType: string): string {
  const extFromName = originalName.split(".").pop()?.toLowerCase() ?? "";
  const extFromMime = mimeType.includes("jpeg") || mimeType.includes("jpg")
    ? "jpg"
    : mimeType.includes("png")
      ? "png"
      : mimeType.includes("webp")
        ? "webp"
        : mimeType.includes("mp4")
          ? "mp4"
          : mimeType.includes("quicktime")
            ? "mov"
            : mimeType.includes("webm")
              ? "webm"
              : "";

  const ext = SAFE_EXT.has(extFromName) ? extFromName : extFromMime || "bin";
  const token = randomBytes(8).toString("hex");
  return `sale-${Date.now()}-${token}.${ext}`;
}
