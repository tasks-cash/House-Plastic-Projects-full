"use client";

import { VoiceWaveform } from "@/components/ui/VoiceWaveform";
import { useTranslations } from "next-intl";
import { VOICE_LANGUAGES, VoiceLang } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import { Loader2, Mic, Square, Trash2 } from "lucide-react";
import { useMemo } from "react";

const VOICE_LANG_KEYS: Record<VoiceLang, string> = {
  "ar-DZ": "voice.langAr",
  "en-US": "voice.langEn",
};

interface VoiceControlsProps {
  id: string;
  supported: boolean | null;
  lang: VoiceLang;
  onLangChange: (lang: VoiceLang) => void;
  isActive: boolean;
  isSaving?: boolean;
  level?: number;
  audioUrl?: string | null;
  onToggle: () => void;
  onClearAudio?: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function VoiceControls({
  id,
  supported,
  lang,
  onLangChange,
  isActive,
  isSaving = false,
  level = 0,
  audioUrl,
  onToggle,
  onClearAudio,
  disabled,
  compact = false,
}: VoiceControlsProps) {
  const t = useTranslations();

  const languageOptions = useMemo(
    () =>
      VOICE_LANGUAGES.map((opt) => ({
        value: opt.value,
        label: t(VOICE_LANG_KEYS[opt.value]),
      })),
    [t]
  );

  if (supported !== true) {
    return null;
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${id}-lang`} className="sr-only">
          {t("voice.voiceLanguage")}
        </label>
        <select
          id={`${id}-lang`}
          value={lang}
          onChange={(e) => onLangChange(e.target.value as VoiceLang)}
          disabled={disabled || isActive || isSaving}
          className={cn(
            "rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5",
            "text-xs text-zinc-200",
            "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-800">
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled || isSaving}
          aria-label={isActive ? t("voice.stopRecording") : t("voice.startRecording")}
          className={cn(
            "relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isActive
              ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-glow"
              : "border-zinc-600 bg-zinc-800/80 text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isActive ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isActive && (
            <span className="absolute -inset-1 rounded-full border border-emerald-400/40 animate-ping" />
          )}
        </button>

        {isActive && <VoiceWaveform level={level} active className="min-w-[3.5rem]" />}

        {isActive && (
          <span className="text-xs font-medium text-emerald-400">{t("voice.listening")}</span>
        )}
      </div>

      {audioUrl && !isActive && (
        <div className="flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-3 py-2">
          <audio src={audioUrl} controls className="h-8 max-w-full flex-1" preload="metadata" />
          {onClearAudio && (
            <button
              type="button"
              onClick={onClearAudio}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
              aria-label={t("voice.deleteRecording")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
