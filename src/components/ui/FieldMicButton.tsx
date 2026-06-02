"use client";

import { cn } from "@/lib/utils";
import { Mic, Square } from "lucide-react";
import { useTranslations } from "next-intl";

interface FieldMicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function FieldMicButton({
  isListening,
  onClick,
  disabled,
  className,
}: FieldMicButtonProps) {
  const t = useTranslations("voice");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? t("stopDictation") : t("startDictation")}
      aria-pressed={isListening}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
        "text-zinc-400 transition-all duration-200",
        "hover:bg-emerald-500/10 hover:text-emerald-400",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        "disabled:pointer-events-none disabled:opacity-40",
        isListening && "bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
        className
      )}
    >
      {isListening ? (
        <Square className="h-3 w-3 fill-current" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
