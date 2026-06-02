"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VoiceActivityPanel } from "@/components/dashboard/VoiceActivityPanel";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { VoiceRecorder } from "@/components/ui/VoiceRecorder";
import { useEnumLabel } from "@/hooks/useEnumLabel";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api-client";
import type { MappedDailyReport, MappedDebt, MappedExpense, MappedSale, MappedTask } from "@/lib/mappers";
import { formatCurrency, formatDate, formatWeight } from "@/lib/utils";
import {
  CreditCard,
  DollarSign,
  PiggyBank,
  Receipt,
  Scale,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardSummary {
  totalSales: number;
  totalPaidSales: number;
  remainingCustomerDebts: number;
  totalExpenses: number;
  debtsWeOwe: number;
  debtsOwedToUs: number;
  netProfit: number;
  totalWeight: number;
  todayRevenue: number;
  todayExpenses: number;
  recentSales: MappedSale[];
  recentExpenses: MappedExpense[];
  recentDebts: MappedDebt[];
  pendingTasks: MappedTask[];
  missingReports: MappedDailyReport[];
}

export default function DashboardPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<DashboardSummary>("/api/dashboard/summary")
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t("dashboard.loadFailed"))
      )
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <DashboardLayout title={t("dashboard.title")}>
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title={t("dashboard.title")}>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          {error || t("dashboard.unableToLoad")}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("dashboard.title")}>
      <div className="space-y-8">
        <div>
          <p className="text-sm text-zinc-400">{t("dashboard.welcomeBack")}</p>
          <h2 className="text-2xl font-bold text-white">{t("dashboard.overview")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("dashboard.totalSales")}
            value={formatCurrency(data.totalSales)}
            icon={TrendingUp}
            accent
          />
          <StatCard
            title={t("dashboard.totalPaid")}
            value={formatCurrency(data.totalPaidSales)}
            icon={DollarSign}
          />
          <StatCard
            title={t("dashboard.customerRemaining")}
            value={formatCurrency(data.remainingCustomerDebts)}
            icon={Users}
          />
          <StatCard
            title={t("dashboard.totalExpenses")}
            value={formatCurrency(data.totalExpenses)}
            icon={Receipt}
          />
          <StatCard
            title={t("dashboard.debtsWeOwe")}
            value={formatCurrency(data.debtsWeOwe)}
            icon={CreditCard}
          />
          <StatCard
            title={t("dashboard.netProfit")}
            value={formatCurrency(data.netProfit)}
            icon={PiggyBank}
            accent
          />
          <StatCard
            title={t("dashboard.totalWeight")}
            value={formatWeight(data.totalWeight)}
            icon={Scale}
          />
          <StatCard
            title={t("dashboard.todayRevenue")}
            value={formatCurrency(data.todayRevenue)}
            icon={Sun}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RecentSection
            title={t("dashboard.recentSales")}
            href="/sales"
            emptyLabel={t("sales.empty")}
            items={data.recentSales.map((s) => ({
              id: s.id,
              primary: s.client,
              secondary: `${s.product} · ${formatDate(s.date)}`,
              amount: formatCurrency(s.total),
              status: s.status,
              statusGroup: "saleStatus",
            }))}
          />
          <RecentSection
            title={t("dashboard.recentExpenses")}
            href="/expenses"
            emptyLabel={t("expenses.empty")}
            items={data.recentExpenses.map((e) => ({
              id: e.id,
              primary: e.title,
              secondary: `${enumLabel("expenseCategory", e.category)} · ${formatDate(e.date)}`,
              amount: formatCurrency(e.amount),
            }))}
          />
          <RecentSection
            title={t("dashboard.recentDebts")}
            href="/debts"
            emptyLabel={t("debts.empty")}
            items={data.recentDebts.map((d) => ({
              id: d.id,
              primary: d.person,
              secondary: `${enumLabel("debtCategory", d.category)} · ${enumLabel("debtDirection", d.direction)}`,
              amount: formatCurrency(d.amount),
              status: d.status,
              statusGroup: "debtStatus",
            }))}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">{t("dashboard.quickVoiceNote")}</h3>
          <VoiceRecorder page="dashboard" fieldName="quickNote" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">{t("dashboard.voiceSearchHistory")}</h3>
          <VoiceActivityPanel />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentSection
            title={t("dashboard.pendingTasks")}
            href="/tasks"
            emptyLabel={t("tasks.empty")}
            items={data.pendingTasks.map((task) => ({
              id: task.id,
              primary: task.title,
              secondary: `${task.assignedTo} · ${task.greenhouse}`,
              amount: enumLabel("taskPriority", task.priority),
              status: task.status,
              statusGroup: "taskStatus",
            }))}
          />
          <RecentSection
            title={t("dashboard.missingReports")}
            href="/daily-reports"
            emptyLabel={t("dailyReports.empty")}
            items={data.missingReports.map((r) => ({
              id: r.id,
              primary: r.employee,
              secondary: `${r.greenhouse} · ${formatDate(r.date)}`,
              amount: String(r.photosCount),
              status: r.status,
              statusGroup: "reportStatus",
            }))}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function RecentSection({
  title,
  href,
  items,
  emptyLabel,
}: {
  title: string;
  href: string;
  emptyLabel: string;
  items: {
    id: string;
    primary: string;
    secondary: string;
    amount: string;
    status?: string;
    statusGroup?: string;
  }[];
}) {
  const t = useTranslations();
  const enumLabel = useEnumLabel();

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-card">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <Link href={href} className="text-xs font-medium text-emerald-400 hover:underline">
          {t("common.viewAll")}
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-500">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">{item.primary}</p>
                <p className="truncate text-xs text-zinc-500">{item.secondary}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold text-white">{item.amount}</span>
                {item.status && item.statusGroup && (
                  <Badge variant={statusToBadgeVariant(item.status)}>
                    {enumLabel(item.statusGroup, item.status)}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
