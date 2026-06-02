"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { isRtlLocale } from "@/i18n/routing";
import { useSession } from "@/hooks/useSession";
import { appConfig } from "@/lib/config";
import { clearMockSession } from "@/lib/mock-auth-client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Wallet,
  Users,
  ListTodo,
  FileText,
  LogOut,
  Leaf,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const navItems = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/sales", key: "nav.sales", icon: Receipt },
  { href: "/debts", key: "nav.debts", icon: CreditCard },
  { href: "/expenses", key: "nav.expenses", icon: Wallet },
  { href: "/employees", key: "nav.employees", icon: Users },
  { href: "/tasks", key: "nav.tasks", icon: ListTodo },
  { href: "/daily-reports", key: "nav.dailyReports", icon: FileText },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useSession();
  const t = useTranslations();
  const isRtl = isRtlLocale(locale);

  const handleLogout = () => {
    clearMockSession();
    router.replace("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex h-screen w-64 shrink-0 flex-col",
          "border-zinc-800 bg-zinc-900",
          "start-0 border-e",
          "transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold text-white">
              {appConfig.name.startsWith("Agro") ? (
                <>
                  Agro<span className="text-emerald-400">{appConfig.name.slice(4)}</span>
                </>
              ) : (
                appConfig.name
              )}
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label={t("common.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
          {navItems.map(({ href, key, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-glow"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-emerald-400" : "text-zinc-500"
                  )}
                />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-zinc-800 p-4">
          <LanguageSwitcher className="hidden lg:block" />
          {user && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-zinc-200">{user.name}</p>
              <div className="mt-1.5">
                <RoleBadge role={user.role} label={t(`roles.${user.role}`)} />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {t("common.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
