"use client";

import { VoiceControls } from "@/components/ui/VoiceControls";
import { VOICE_INPUT_ENABLED } from "@/lib/features";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";

interface VoiceSearchInputProps {
  page: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function VoiceSearchInput({
  page,
  value,
  onChange,
  placeholder = "Search…",
  className,
  disabled,
}: VoiceSearchInputProps) {
  const inputId = useId();
  const searchHistoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedQuery = useRef("");

  const voice = useVoiceInput({
    page,
    fieldName: "search",
    value,
    onChange,
    trackTextHistory: false,
  });

  const scheduleSearchHistory = useCallback(
    (query: string, source: "text" | "voice" = "text") => {
      const trimmed = query.trim();
      if (!trimmed || trimmed === lastSavedQuery.current) return;
      if (searchHistoryTimer.current) clearTimeout(searchHistoryTimer.current);
      searchHistoryTimer.current = setTimeout(() => {
        lastSavedQuery.current = trimmed;
        void voice.persistSearchHistory(trimmed, source);
      }, 600);
    },
    [voice]
  );

  useEffect(() => {
    if (!VOICE_INPUT_ENABLED) return;
    scheduleSearchHistory(value, "text");
  }, [value, scheduleSearchHistory]);

  const handleVoiceToggle = async () => {
    const wasActive = voice.isVoiceActive;
    await voice.toggleVoice();
    if (wasActive && value.trim()) {
      void voice.persistSearchHistory(value.trim(), "voice");
    }
  };

  if (!VOICE_INPUT_ENABLED) {
    return (
      <div className={cn("relative flex-1", className)}>
        <Search className="pointer-events-none absolute left-3 top-3 z-10 h-4 w-4 text-zinc-500" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4",
            "text-sm text-zinc-100 placeholder:text-zinc-500",
            "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn(voice.supported === true ? "space-y-2" : "", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 z-10 h-4 w-4 text-zinc-500" />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || voice.isVoiceActive}
          className={cn(
            "w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4",
            "text-sm text-zinc-100 placeholder:text-zinc-500",
            "transition-colors duration-200",
            "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
            voice.isVoiceActive && "border-emerald-500/40 ring-1 ring-emerald-500/20"
          )}
        />
      </div>
      {voice.supported === true && (
        <VoiceControls
          id={inputId}
          supported={voice.supported}
          lang={voice.lang}
          onLangChange={voice.setLang}
          isActive={voice.isVoiceActive}
          isSaving={voice.isSaving}
          level={voice.level}
          audioUrl={voice.audioUrl}
          onToggle={handleVoiceToggle}
          onClearAudio={voice.clearAudio}
          disabled={disabled}
          compact
        />
      )}
    </div>
  );
}
