"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { VoiceSearchInput } from "@/components/ui/VoiceSearchInput";
import { VoiceTextInput } from "@/components/ui/VoiceTextInput";
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
import type { MappedExpense } from "@/lib/mappers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  category: "medicine",
  title: "",
  supplier: "",
  amount: "",
  payment: "cash",
  greenhouse: "GH-A",
  notes: "",
};

export default function ExpensesPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const { expenseCategoryOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const { canWriteModule, canDelete } = usePermissions();
  const canWrite = canWriteModule("expenses");
  const [expenses, setExpenses] = useState<MappedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MappedExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappedExpense | null>(null);
  const [saving, setSaving] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      const data = await apiGet<MappedExpense[]>(`/api/expenses?${params}`);
      setExpenses(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("expenses.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, showToast, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExpenses();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadExpenses]);

  const totals = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const capitalized = expenses
      .filter((e) => e.isCapitalized)
      .reduce((sum, e) => sum + e.amount, 0);
    return { total, capitalized, count: expenses.length };
  }, [expenses]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/expenses/${deleteTarget.id}`);
      showToast(t("toast.deleted"), "success");
      setDeleteTarget(null);
      await loadExpenses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.deleteFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MappedExpense>[] = [
    { key: "date", header: t("common.date"), render: (r) => formatDate(r.date) },
    {
      key: "category",
      header: t("debts.category"),
      render: (r) => (
        <div className="flex items-center gap-2">
          <span>{enumLabel("expenseCategory", r.category)}</span>
          {r.isCapitalized && <Badge variant="info">Cap</Badge>}
        </div>
      ),
    },
    { key: "title", header: t("expenses.titleField") },
    {
      key: "supplier",
      header: t("expenses.supplier"),
      render: (r) => r.supplier || "—",
      hideOnMobile: true,
    },
    {
      key: "amount",
      header: t("debts.amount"),
      render: (r) => (
        <span className="font-medium text-white">{formatCurrency(r.amount)}</span>
      ),
    },
    {
      key: "payment",
      header: t("expenses.payment"),
      render: (r) => enumLabel("payment", r.payment),
    },
    { key: "greenhouse", header: t("expenses.greenhouse"), hideOnMobile: true },
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
    <DashboardLayout title={t("expenses.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("expenses.management")}
          description={t("expenses.description")}
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("expenses.addExpense")}
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <VoiceSearchInput
            page="expenses"
            value={search}
            onChange={setSearch}
            placeholder={t("expenses.searchPlaceholder")}
          />
          <Select
            className="lg:w-52"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder={t("expenses.allCategories")}
            options={[{ value: "", label: t("expenses.allCategories") }, ...expenseCategoryOptions]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title={t("dashboard.totalExpenses")} value={formatCurrency(totals.total)} />
          <StatCard title={t("sales.columns.total")} value={formatCurrency(totals.capitalized)} />
          <StatCard title={t("sales.records")} value={String(totals.count)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center text-zinc-500">
            {t("expenses.empty")} {canWrite && t("expenses.emptyHint")}
          </div>
        ) : (
          <DataTable columns={columns} data={expenses} keyExtractor={(r) => r.id} />
        )}

        <ExpenseFormModal
          isOpen={modalOpen}
          expense={editing}
          saving={saving}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditing(null);
            showToast(editing ? t("debts.updated") : t("debts.created"), "success");
            await loadExpenses();
          }}
          setSaving={setSaving}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={t("expenses.deleteTitle")}
          message={t("expenses.deleteMessage", { title: deleteTarget?.title ?? "" })}
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function ExpenseFormModal({
  isOpen,
  expense,
  saving,
  onClose,
  onSaved,
  setSaving,
}: {
  isOpen: boolean;
  expense: MappedExpense | null;
  saving: boolean;
  onClose: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
}) {
  const t = useTranslations();
  const { expenseCategoryOptions, greenhouseOptions, paymentMethodOptions } =
    useTranslatedOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (expense) {
      setForm({
        date: expense.date,
        category: expense.category,
        title: expense.title,
        supplier: expense.supplier,
        amount: String(expense.amount),
        payment: expense.payment,
        greenhouse: expense.greenhouse,
        notes: expense.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, expense]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      date: form.date,
      category: form.category,
      title: form.title,
      supplier: form.supplier,
      amount: Number(form.amount),
      payment: form.payment,
      greenhouse: form.greenhouse,
      notes: form.notes,
    };

    try {
      if (expense) {
        await apiPut(`/api/expenses/${expense.id}`, payload);
      } else {
        await apiPost("/api/expenses", payload);
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
      title={expense ? t("expenses.editExpense") : t("expenses.addExpense")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="expense-form" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      }
    >
      <form
        id="expense-form"
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
          label={t("debts.category")}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={expenseCategoryOptions}
        />
        <div className="sm:col-span-2">
          <VoiceTextInput
            label={t("expenses.titleField")}
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            page="expenses"
            fieldName="title"
            placeholder={t("expenses.titlePlaceholder")}
            required
          />
        </div>
        <Input
          label={t("expenses.supplier")}
          value={form.supplier}
          onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          placeholder={t("expenses.supplierPlaceholder")}
        />
        <Input
          label={t("debts.amount")}
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <Select
          label={t("expenses.payment")}
          value={form.payment}
          onChange={(e) => setForm({ ...form, payment: e.target.value })}
          options={paymentMethodOptions}
        />
        <Select
          label={t("expenses.greenhouse")}
          value={form.greenhouse}
          onChange={(e) => setForm({ ...form, greenhouse: e.target.value })}
          options={greenhouseOptions.filter((g) => g.value !== "All")}
        />
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("common.notes")}
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            page="expenses"
            fieldName="notes"
            placeholder={t("common.optional")}
          />
        </div>
      </form>
    </Modal>
  );
}
