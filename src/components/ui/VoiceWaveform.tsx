"use client";

import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  level: number;
  active: boolean;
  className?: string;
}

export function VoiceWaveform({ level, active, className }: VoiceWaveformProps) {
  const bars = [0.35, 0.55, 0.75, 1, 0.8, 0.6, 0.45];

  return (
    <div
      className={cn("flex h-6 items-end justify-center gap-0.5", className)}
      aria-hidden={!active}
    >
      {bars.map((scale, index) => {
        const height = active
          ? `${Math.max(18, Math.min(100, (level * 80 + 20) * scale))}%`
          : "18%";
        return (
          <span
            key={index}
            className={cn(
              "w-1 rounded-full transition-all duration-150",
              active ? "bg-emerald-400" : "bg-zinc-600"
            )}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}
