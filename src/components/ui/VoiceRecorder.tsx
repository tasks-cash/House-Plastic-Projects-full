"use client";

import { VoiceControls } from "@/components/ui/VoiceControls";
import { useTranslations } from "next-intl";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

interface VoiceRecorderProps {
  page: string;
  fieldName: string;
  className?: string;
  onTranscript?: (text: string) => void;
}

/** Standalone voice recorder with speech-to-text and history persistence. */
export function VoiceRecorder({ page, fieldName, className, onTranscript }: VoiceRecorderProps) {
  const t = useTranslations();
  const id = useId();
  const [text, setText] = useState("");

  const voice = useVoiceInput({
    page,
    fieldName,
    value: text,
    onChange: (next) => {
      setText(next);
      onTranscript?.(next);
    },
    trackTextHistory: true,
  });

  return (
    <div className={cn("space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4", className)}>
      <p className="text-sm font-medium text-zinc-200">{t("voice.voiceNote")}</p>
      <textarea
        readOnly
        value={text}
        placeholder={t("voice.speakNaturally")}
        className="min-h-[80px] w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
      />
      {voice.supported === true && (
        <VoiceControls
          id={id}
          supported={voice.supported}
          lang={voice.lang}
          onLangChange={voice.setLang}
          isActive={voice.isVoiceActive}
          isSaving={voice.isSaving}
          level={voice.level}
          audioUrl={voice.audioUrl}
          onToggle={voice.toggleVoice}
          onClearAudio={voice.clearAudio}
        />
      )}
    </div>
  );
}
