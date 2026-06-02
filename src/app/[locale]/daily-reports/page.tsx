"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { VoiceSearchInput } from "@/components/ui/VoiceSearchInput";
import { VoiceTextarea } from "@/components/ui/VoiceTextarea";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { useEnumLabel } from "@/hooks/useEnumLabel";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { useTranslatedOptions } from "@/hooks/useTranslatedOptions";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { MappedDailyReport, MappedEmployee } from "@/lib/mappers";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Camera, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  date: todayIso(),
  employee: "",
  employeeId: "",
  greenhouse: "GH-A",
  workDone: "",
  problems: "",
  productionNotes: "",
  photosCount: "0",
  status: "submitted",
};

export default function DailyReportsPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const { reportStatusOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const { canWriteModule, canDelete } = usePermissions();
  const canWrite = canWriteModule("daily-reports");
  const [reports, setReports] = useState<MappedDailyReport[]>([]);
  const [employees, setEmployees] = useState<MappedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MappedDailyReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappedDailyReport | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    try {
      const data = await apiGet<MappedEmployee[]>("/api/employees");
      setEmployees(data);
    } catch {
      // Employee list is optional for viewing reports
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (dateFilter) {
        params.set("from", dateFilter);
        params.set("to", dateFilter);
      }
      const data = await apiGet<MappedDailyReport[]>(`/api/daily-reports?${params}`);
      setReports(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("dailyReports.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFilter, showToast, t]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadReports]);

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((e) => e.status === "active")
        .map((e) => ({ value: e.name, label: e.name, id: e.id })),
    [employees]
  );

  const filteredReports = useMemo(() => {
    if (!employeeFilter) return reports;
    return reports.filter((r) => r.employee === employeeFilter);
  }, [reports, employeeFilter]);

  const summary = useMemo(() => {
    const today = todayIso();
    const todayReports = filteredReports.filter((r) => r.date === today);
    const reportsToday = todayReports.filter((r) => r.status !== "missing").length;
    const missing = todayReports.filter((r) => r.status === "missing").length;
    const problems = filteredReports.filter(
      (r) => r.problems.trim().length > 0 && r.status !== "missing"
    ).length;
    const approved = filteredReports.filter((r) => r.status === "approved").length;
    return { reportsToday, missing, problems, approved };
  }, [filteredReports]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/daily-reports/${deleteTarget.id}`);
      showToast(t("toast.deleted"), "success");
      setDeleteTarget(null);
      await loadReports();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.deleteFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MappedDailyReport>[] = [
    { key: "date", header: t("common.date"), render: (r) => formatDate(r.date) },
    { key: "employee", header: t("dailyReports.employee") },
    { key: "greenhouse", header: t("expenses.greenhouse"), hideOnMobile: true },
    {
      key: "workDone",
      header: t("dailyReports.workDone"),
      render: (r) => (
        <span className="line-clamp-1 max-w-[200px] text-zinc-300">
          {r.workDone || "—"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "problems",
      header: t("dailyReports.problems"),
      render: (r) =>
        r.problems ? (
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1 max-w-[120px]">{r.problems}</span>
          </span>
        ) : (
          <span className="text-zinc-500">{t("common.none")}</span>
        ),
      hideOnMobile: true,
    },
    {
      key: "photosCount",
      header: t("dailyReports.photosCount"),
      render: (r) => (
        <span className="flex items-center gap-1 text-zinc-300">
          <Camera className="h-3.5 w-3.5 text-zinc-500" />
          {r.photosCount}
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <Badge variant={statusToBadgeVariant(r.status)}>
          {enumLabel("reportStatus", r.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (r) => (
        <div className="flex items-center gap-1">
          {canWrite && (
            <button
              type="button"
              onClick={() => {
                setEditing(r);
                setModalOpen(true);
              }}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-blue-400"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteTarget(r)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title={t("dailyReports.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("dailyReports.title")}
          description={t("dailyReports.description")}
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("dailyReports.addReport")}
              </Button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t("nav.dailyReports")} value={String(summary.reportsToday)} accent />
          <StatCard title={t("dashboard.missingReports")} value={String(summary.missing)} />
          <StatCard title={t("dailyReports.problems")} value={String(summary.problems)} />
          <StatCard
            title={t("enums.reportStatus.approved")}
            value={String(summary.approved)}
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <VoiceSearchInput
            page="daily-reports"
            value={search}
            onChange={setSearch}
            placeholder={t("dailyReports.searchPlaceholder")}
          />
          <Input
            className="lg:w-44"
            label={t("common.date")}
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Select
            className="lg:w-48"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            placeholder={t("common.all")}
            options={[
              { value: "", label: t("common.all") },
              ...employeeOptions.map(({ value, label }) => ({ value, label })),
            ]}
          />
          <Select
            className="lg:w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder={t("tasks.allStatuses")}
            options={[{ value: "", label: t("tasks.allStatuses") }, ...reportStatusOptions]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center text-zinc-500">
            {t("dailyReports.empty")} {canWrite && t("dailyReports.emptyHint")}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredReports}
            keyExtractor={(r) => r.id}
          />
        )}

        <DailyReportFormModal
          isOpen={modalOpen}
          report={editing}
          saving={saving}
          employeeOptions={employeeOptions}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditing(null);
            showToast(editing ? t("debts.updated") : t("debts.created"), "success");
            await loadReports();
          }}
          setSaving={setSaving}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={t("dailyReports.deleteTitle")}
          message={t("dailyReports.deleteMessage", { employee: deleteTarget?.employee ?? "" })}
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function DailyReportFormModal({
  isOpen,
  report,
  saving,
  employeeOptions,
  onClose,
  onSaved,
  setSaving,
}: {
  isOpen: boolean;
  report: MappedDailyReport | null;
  saving: boolean;
  employeeOptions: { value: string; label: string; id: string }[];
  onClose: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
}) {
  const t = useTranslations();
  const { greenhouseOptions, reportStatusOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (report) {
      const match = employeeOptions.find((e) => e.value === report.employee);
      setForm({
        date: report.date,
        employee: report.employee,
        employeeId: match?.id ?? "",
        greenhouse: report.greenhouse,
        workDone: report.workDone,
        problems: report.problems,
        productionNotes: report.productionNotes,
        photosCount: String(report.photosCount),
        status: report.status,
      });
    } else {
      setForm({ ...emptyForm, date: todayIso() });
    }
  }, [isOpen, report, employeeOptions]);

  const handleEmployeeChange = (name: string) => {
    const match = employeeOptions.find((e) => e.value === name);
    setForm({
      ...form,
      employee: name,
      employeeId: match?.id ?? "",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {
      date: form.date,
      employee: form.employee,
      greenhouse: form.greenhouse,
      workDone: form.workDone,
      problems: form.problems,
      productionNotes: form.productionNotes,
      photosCount: Number(form.photosCount),
      status: form.status,
    };
    if (form.employeeId) {
      payload.employeeId = form.employeeId;
    }

    try {
      if (report) {
        await apiPut(`/api/daily-reports/${report.id}`, payload);
      } else {
        await apiPost("/api/daily-reports", payload);
      }
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={report ? t("dailyReports.editReport") : t("dailyReports.addReport")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="daily-report-form" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      }
    >
      <form
        id="daily-report-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Input
          label={t("common.date")}
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <Select
          label={t("dailyReports.employee")}
          value={form.employee}
          onChange={(e) => handleEmployeeChange(e.target.value)}
          placeholder={t("dailyReports.selectEmployee")}
          options={employeeOptions}
          required
        />
        <Select
          label={t("expenses.greenhouse")}
          value={form.greenhouse}
          onChange={(e) => setForm({ ...form, greenhouse: e.target.value })}
          options={greenhouseOptions.filter((g) => g.value !== "All")}
        />
        <Select
          label={t("common.status")}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={reportStatusOptions}
        />
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("dailyReports.workDone")}
            value={form.workDone}
            onChange={(v) => setForm({ ...form, workDone: v })}
            page="daily-reports"
            fieldName="workDone"
            placeholder={t("dailyReports.workDonePlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("dailyReports.problems")}
            value={form.problems}
            onChange={(v) => setForm({ ...form, problems: v })}
            page="daily-reports"
            fieldName="problems"
            placeholder={t("dailyReports.problemsPlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("dailyReports.productionNotes")}
            value={form.productionNotes}
            onChange={(v) => setForm({ ...form, productionNotes: v })}
            page="daily-reports"
            fieldName="productionNotes"
            placeholder={t("dailyReports.productionNotesPlaceholder")}
          />
        </div>
        <Input
          label={t("dailyReports.photosCount")}
          type="number"
          min="0"
          value={form.photosCount}
          onChange={(e) => setForm({ ...form, photosCount: e.target.value })}
        />
      </form>
    </Modal>
  );
}
