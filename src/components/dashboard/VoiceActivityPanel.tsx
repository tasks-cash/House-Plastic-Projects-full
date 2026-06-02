"use client";

import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api-client";
import type {
  SearchHistoryEntry,
  TextHistoryEntry,
  VoiceHistoryEntry,
} from "@/lib/voice/history-client";
import { formatDateTime } from "@/lib/utils";
import { Mic, PenLine, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface VoiceActivityData {
  recentVoice: VoiceHistoryEntry[];
  recentSearches: SearchHistoryEntry[];
  recentText: TextHistoryEntry[];
}

export function VoiceActivityPanel() {
  const t = useTranslations();
  const [data, setData] = useState<VoiceActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<VoiceActivityData>("/api/voice/activity")
      .then(setData)
      .catch(() => setData({ recentVoice: [], recentSearches: [], recentText: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <HistoryCard
        title={t("voice.activity")}
        icon={Mic}
        empty={t("voice.noVoice")}
        items={data.recentVoice.map((v) => ({
          id: v.id,
          primary: v.recognizedText || t("voice.audioOnly"),
          secondary: `${v.page} · ${v.fieldName}`,
          meta: formatDateTime(v.createdAt),
        }))}
      />
      <HistoryCard
        title={t("voice.recentSearches")}
        icon={Search}
        empty={t("voice.noSearches")}
        items={data.recentSearches.map((s) => ({
          id: s.id,
          primary: s.query,
          secondary: `${s.page}${s.source === "voice" ? t("voice.voiceSuffix") : ""}`,
          meta: formatDateTime(s.createdAt),
        }))}
      />
      <HistoryCard
        title={t("voice.recentWritten")}
        icon={PenLine}
        empty={t("voice.noWritten")}
        items={data.recentText.map((entry) => ({
          id: entry.id,
          primary: entry.text.length > 80 ? `${entry.text.slice(0, 80)}…` : entry.text,
          secondary: `${entry.page} · ${entry.fieldName}`,
          meta: formatDateTime(entry.createdAt),
        }))}
      />
    </div>
  );
}

function HistoryCard({
  title,
  icon: Icon,
  empty,
  items,
}: {
  title: string;
  icon: typeof Mic;
  empty: string;
  items: { id: string; primary: string; secondary: string; meta: string }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-card">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <Icon className="h-4 w-4 text-emerald-400" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-3.5">
              <p className="text-sm font-medium text-zinc-200">{item.primary}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{item.secondary}</p>
              <p className="mt-1 text-xs text-zinc-600">{item.meta}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
