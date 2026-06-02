"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {!compact && (
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("label")}
        </p>
      )}
      <div className="flex gap-2">
        {locales.map((id) => {
          const active = locale === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchLocale(id)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-glow"
                  : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              )}
              aria-pressed={active}
            >
              {localeLabels[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
