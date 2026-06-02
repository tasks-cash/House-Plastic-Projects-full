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
import { DEBT_STATUSES } from "@/lib/constants";
import type { MappedDebt } from "@/lib/mappers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  person: "",
  category: "investment",
  direction: "we_owe",
  source: "",
  amount: "",
  paid: "0",
  dueDate: "",
  notes: "",
};

export default function DebtsPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const { debtCategoryOptions, debtDirectionOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const { canWriteModule, canDelete } = usePermissions();
  const canWrite = canWriteModule("debts");
  const [debts, setDebts] = useState<MappedDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MappedDebt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappedDebt | null>(null);
  const [saving, setSaving] = useState(false);

  const debtStatusFilterOptions = useMemo(
    () => [
      { value: "", label: t("sales.allStatuses") },
      ...DEBT_STATUSES.map((s) => ({ value: s, label: enumLabel("debtStatus", s) })),
    ],
    [t, enumLabel]
  );

  const loadDebts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (directionFilter) params.set("direction", directionFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      const data = await apiGet<MappedDebt[]>(`/api/debts?${params}`);
      setDebts(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("debts.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [search, directionFilter, categoryFilter, statusFilter, showToast, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDebts();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadDebts]);

  const totals = useMemo(() => {
    const weOwe = debts
      .filter((d) => d.direction === "we_owe")
      .reduce((sum, d) => sum + d.remaining, 0);
    const owedToUs = debts
      .filter((d) => d.direction === "owed_to_us")
      .reduce((sum, d) => sum + d.remaining, 0);
    const totalAmount = debts.reduce((sum, d) => sum + d.amount, 0);
    return { weOwe, owedToUs, totalAmount, count: debts.length };
  }, [debts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/debts/${deleteTarget.id}`);
      showToast(t("toast.deleted"), "success");
      setDeleteTarget(null);
      await loadDebts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("debts.deleteFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MappedDebt>[] = [
    { key: "date", header: t("common.date"), render: (r) => formatDate(r.date) },
    { key: "person", header: t("debts.person") },
    {
      key: "category",
      header: t("debts.category"),
      render: (r) => enumLabel("debtCategory", r.category),
    },
    {
      key: "direction",
      header: t("debts.direction"),
      render: (r) => (
        <Badge variant={r.direction === "we_owe" ? "danger" : "success"}>
          {enumLabel("debtDirection", r.direction)}
        </Badge>
      ),
    },
    { key: "source", header: t("debts.source"), hideOnMobile: true },
    {
      key: "amount",
      header: t("debts.amount"),
      render: (r) => formatCurrency(r.amount),
    },
    { key: "paid", header: t("debts.paid"), render: (r) => formatCurrency(r.paid) },
    {
      key: "remaining",
      header: t("sales.remaining"),
      render: (r) => (
        <span className={r.remaining > 0 ? "font-medium text-amber-400" : "text-zinc-400"}>
          {formatCurrency(r.remaining)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: t("debts.dueDate"),
      render: (r) => (r.dueDate ? formatDate(r.dueDate) : "—"),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <Badge variant={statusToBadgeVariant(r.status)}>
          {enumLabel("debtStatus", r.status)}
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
    <DashboardLayout title={t("debts.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("debts.management")}
          description={t("debts.description")}
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("debts.addDebt")}
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <VoiceSearchInput
            page="debts"
            value={search}
            onChange={setSearch}
            placeholder={t("debts.searchPlaceholder")}
          />
          <Select
            className="lg:w-44"
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            placeholder={t("common.all")}
            options={[{ value: "", label: t("common.all") }, ...debtDirectionOptions]}
          />
          <Select
            className="lg:w-44"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder={t("expenses.allCategories")}
            options={[{ value: "", label: t("expenses.allCategories") }, ...debtCategoryOptions]}
          />
          <Select
            className="lg:w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={debtStatusFilterOptions}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("enums.debtDirection.we_owe")}
            value={formatCurrency(totals.weOwe)}
          />
          <StatCard
            title={t("enums.debtDirection.owed_to_us")}
            value={formatCurrency(totals.owedToUs)}
          />
          <StatCard title={t("debts.amount")} value={formatCurrency(totals.totalAmount)} />
          <StatCard title={t("sales.records")} value={String(totals.count)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : debts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center text-zinc-500">
            {t("debts.empty")} {canWrite && t("debts.emptyHint")}
          </div>
        ) : (
          <DataTable columns={columns} data={debts} keyExtractor={(r) => r.id} />
        )}

        <DebtFormModal
          isOpen={modalOpen}
          debt={editing}
          saving={saving}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditing(null);
            showToast(editing ? t("debts.updated") : t("debts.created"), "success");
            await loadDebts();
          }}
          setSaving={setSaving}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={t("debts.deleteTitle")}
          message={t("debts.deleteMessage", { person: deleteTarget?.person ?? "" })}
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function DebtFormModal({
  isOpen,
  debt,
  saving,
  onClose,
  onSaved,
  setSaving,
}: {
  isOpen: boolean;
  debt: MappedDebt | null;
  saving: boolean;
  onClose: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
}) {
  const t = useTranslations();
  const { debtCategoryOptions, debtDirectionOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (debt) {
      setForm({
        date: debt.date,
        person: debt.person,
        category: debt.category,
        direction: debt.direction,
        source: debt.source,
        amount: String(debt.amount),
        paid: String(debt.paid),
        dueDate: debt.dueDate,
        notes: debt.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, debt]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      date: form.date,
      person: form.person,
      category: form.category,
      direction: form.direction,
      source: form.source,
      amount: Number(form.amount),
      paid: Number(form.paid),
      dueDate: form.dueDate || null,
      notes: form.notes,
    };

    try {
      if (debt) {
        await apiPut(`/api/debts/${debt.id}`, payload);
      } else {
        await apiPost("/api/debts", payload);
      }
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("debts.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={debt ? t("debts.editDebt") : t("debts.addDebt")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="debt-form" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      }
    >
      <form
        id="debt-form"
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
        <Input
          label={t("debts.person")}
          value={form.person}
          onChange={(e) => setForm({ ...form, person: e.target.value })}
          required
        />
        <Select
          label={t("debts.category")}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={debtCategoryOptions}
        />
        <Select
          label={t("debts.direction")}
          value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value })}
          options={debtDirectionOptions}
        />
        <div className="sm:col-span-2">
          <Input
            label={t("debts.source")}
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            required
          />
        </div>
        <Input
          label={t("debts.amount")}
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <Input
          label={t("debts.paid")}
          type="number"
          min="0"
          step="0.01"
          value={form.paid}
          onChange={(e) => setForm({ ...form, paid: e.target.value })}
        />
        <Input
          label={t("debts.dueDate")}
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("common.notes")}
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            page="debts"
            fieldName="notes"
            placeholder={t("common.optional")}
          />
        </div>
      </form>
    </Modal>
  );
}
