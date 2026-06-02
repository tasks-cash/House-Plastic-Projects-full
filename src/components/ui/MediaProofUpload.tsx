"use client";

import { useTranslations } from "next-intl";
import { apiUploadSalesMedia } from "@/lib/api-client";
import type { MappedSaleMediaProof } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Trash2, Video } from "lucide-react";
import { useRef, useState } from "react";

interface MediaProofUploadProps {
  value: MappedSaleMediaProof[];
  onChange: (items: MappedSaleMediaProof[]) => void;
  error?: string;
  disabled?: boolean;
}

export function MediaProofUpload({ value, onChange, error, disabled }: MediaProofUploadProps) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;
    setUploadError(null);
    setUploading(true);

    const next = [...value];

    try {
      for (const file of Array.from(files)) {
        const uploaded = await apiUploadSalesMedia(file);
        next.push({
          url: uploaded.url,
          type: uploaded.type,
          filename: uploaded.filename,
          uploadedAt: uploaded.uploadedAt,
        });
      }
      onChange(next);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("media.uploadFailed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-zinc-300">
          {t("media.proofTitle")} <span className="text-red-400">*</span>
        </label>
        <span className="text-xs text-zinc-500">{t("media.formats")}</span>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-dashed p-4 transition-colors",
          error || uploadError
            ? "border-red-500/40 bg-red-500/5"
            : "border-zinc-700 bg-zinc-800/30 hover:border-emerald-500/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          multiple
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl py-6",
            "text-sm text-zinc-400 transition-colors",
            "hover:bg-zinc-800/60 hover:text-emerald-400",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          ) : (
            <ImagePlus className="h-8 w-8 text-zinc-500" />
          )}
          <span>{uploading ? t("media.uploading") : t("media.uploadPrompt")}</span>
        </button>

        {value.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {value.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-zinc-950">
                    <Video className="h-8 w-8 text-emerald-400" />
                    <video src={item.url} className="max-h-24 w-full" controls preload="metadata" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  className="absolute right-2 top-2 rounded-lg bg-zinc-950/80 p-1.5 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                  aria-label={t("media.removeMedia")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <p className="text-xs text-red-400">{error || uploadError}</p>
      )}
    </div>
  );
}
