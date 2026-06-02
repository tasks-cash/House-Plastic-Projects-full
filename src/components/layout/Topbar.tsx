"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useSession } from "@/hooks/useSession";
import { Menu, Bell, User } from "lucide-react";
import { useTranslations } from "next-intl";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { user } = useSession();
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
          aria-label={t("common.closeMenu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-white sm:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="lg:hidden">
          <LanguageSwitcher compact />
        </div>
        <button
          type="button"
          className="relative rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label={t("common.notifications")}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-2 py-1.5 sm:px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
            <User className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-sm font-medium text-zinc-200">
              {user?.name ?? t("common.user")}
            </span>
            {user && (
              <RoleBadge role={user.role} label={t(`roles.${user.role}`)} className="mt-0.5 w-fit" />
            )}
          </div>
          {user && (
            <RoleBadge role={user.role} label={t(`roles.${user.role}`)} className="sm:hidden" />
          )}
        </div>
      </div>
    </header>
  );
}
