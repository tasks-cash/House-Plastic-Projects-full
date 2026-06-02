"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
import { MediaProofUpload } from "@/components/ui/MediaProofUpload";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { VoiceSearchInput } from "@/components/ui/VoiceSearchInput";
import { VoiceTextInput } from "@/components/ui/VoiceTextInput";
import { VoiceTextarea } from "@/components/ui/VoiceTextarea";
import { useEnumLabel } from "@/hooks/useEnumLabel";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { useTranslatedOptions } from "@/hooks/useTranslatedOptions";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { MappedSale, MappedSaleMediaProof } from "@/lib/mappers";
import { formatCurrency, formatDate, formatWeight } from "@/lib/utils";
import { Image as ImageIcon, Pencil, Plus, Trash2, Video } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  client: "",
  greenhouse: "",
  product: "Tomato",
  weight: "",
  unit: "kg",
  pricePerUnit: "",
  paid: "0",
  notes: "",
};

export default function SalesPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const { saleStatusOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const { canWriteModule, canDelete } = usePermissions();
  const canWrite = canWriteModule("sales");
  const [sales, setSales] = useState<MappedSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MappedSale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappedSale | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const data = await apiGet<MappedSale[]>(`/api/sales?${params}`);
      setSales(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("sales.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSales();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadSales]);

  const totals = useMemo(() => {
    const total = sales.reduce((sum, s) => sum + s.total, 0);
    const paid = sales.reduce((sum, s) => sum + s.paid, 0);
    const remaining = sales.reduce((sum, s) => sum + s.remaining, 0);
    const weight = sales.reduce((sum, s) => sum + s.weight, 0);
    return { total, paid, remaining, weight, count: sales.length };
  }, [sales]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/sales/${deleteTarget.id}`);
      showToast(t("sales.deleted"), "success");
      setDeleteTarget(null);
      await loadSales();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("sales.deleteFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MappedSale>[] = [
    { key: "date", header: t("sales.columns.date"), render: (r) => formatDate(r.date) },
    { key: "client", header: t("sales.columns.client"), render: (r) => r.client || "—" },
    { key: "product", header: t("sales.columns.product") },
    {
      key: "media",
      header: t("common.proof"),
      hideOnMobile: true,
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
          {r.mediaProof.some((m) => m.type === "image") && <ImageIcon className="h-3.5 w-3.5" />}
          {r.mediaProof.some((m) => m.type === "video") && <Video className="h-3.5 w-3.5" />}
          {r.mediaProof.length}
        </span>
      ),
    },
    {
      key: "weight",
      header: t("sales.columns.weight"),
      render: (r) => `${formatWeight(r.weight)} ${r.unit}`,
    },
    {
      key: "price",
      header: t("sales.columns.pricePerUnit"),
      render: (r) => formatCurrency(r.price),
    },
    {
      key: "total",
      header: t("sales.columns.total"),
      render: (r) => (
        <span className="font-medium text-white">{formatCurrency(r.total)}</span>
      ),
    },
    { key: "paid", header: t("sales.columns.paid"), render: (r) => formatCurrency(r.paid) },
    {
      key: "remaining",
      header: t("sales.columns.remaining"),
      render: (r) => (
        <span className={r.remaining > 0 ? "text-amber-400" : "text-zinc-400"}>
          {formatCurrency(r.remaining)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <Badge variant={statusToBadgeVariant(r.status)}>
          {enumLabel("saleStatus", r.status)}
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
    <DashboardLayout title={t("sales.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("sales.management")}
          description={t("sales.description")}
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("sales.addSale")}
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <VoiceSearchInput
            page="sales"
            value={search}
            onChange={setSearch}
            placeholder={t("sales.searchPlaceholder")}
          />
          <Select
            className="lg:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder={t("sales.allStatuses")}
            options={[{ value: "", label: t("sales.allStatuses") }, ...saleStatusOptions]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t("sales.totalSales")} value={formatCurrency(totals.total)} />
          <StatCard title={t("sales.totalPaid")} value={formatCurrency(totals.paid)} />
          <StatCard title={t("sales.remaining")} value={formatCurrency(totals.remaining)} />
          <StatCard
            title={t("sales.records")}
            value={String(totals.count)}
            subtitle={t("dashboard.recordsTotal", {
              count: totals.count,
              weight: totals.weight.toLocaleString(),
            })}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center text-zinc-500">
            {t("sales.empty")} {canWrite && t("sales.emptyHint")}
          </div>
        ) : (
          <DataTable columns={columns} data={sales} keyExtractor={(r) => r.id} />
        )}

        <SaleFormModal
          isOpen={modalOpen}
          sale={editing}
          saving={saving}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditing(null);
            showToast(editing ? t("sales.updated") : t("sales.created"), "success");
            await loadSales();
          }}
          setSaving={setSaving}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={t("sales.deleteTitle")}
          message={t("sales.deleteMessage", {
            client: deleteTarget?.client
              ? t("sales.deleteMessageClient", { client: deleteTarget.client })
              : "",
          })}
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function SaleFormModal({
  isOpen,
  sale,
  saving,
  onClose,
  onSaved,
  setSaving,
}: {
  isOpen: boolean;
  sale: MappedSale | null;
  saving: boolean;
  onClose: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
}) {
  const t = useTranslations();
  const { greenhouseOptionsWithNone, productOptions, unitOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [mediaProof, setMediaProof] = useState<MappedSaleMediaProof[]>([]);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (sale) {
      setForm({
        date: sale.date,
        client: sale.client,
        greenhouse: sale.greenhouse,
        product: sale.product,
        weight: String(sale.weight),
        unit: sale.unit,
        pricePerUnit: String(sale.price),
        paid: String(sale.paid),
        notes: sale.notes,
      });
      setMediaProof(sale.mediaProof);
    } else {
      setForm(emptyForm);
      setMediaProof([]);
    }
    setMediaError("");
  }, [isOpen, sale]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (mediaProof.length < 1) {
      setMediaError(t("sales.mediaProofRequired"));
      return;
    }

    setSaving(true);

    const payload = {
      date: form.date,
      client: form.client,
      greenhouse: form.greenhouse || undefined,
      product: form.product,
      weight: Number(form.weight),
      unit: form.unit,
      pricePerUnit: Number(form.pricePerUnit),
      paid: Number(form.paid),
      notes: form.notes,
      mediaProof,
    };

    try {
      if (sale) {
        await apiPut(`/api/sales/${sale.id}`, payload);
      } else {
        await apiPost("/api/sales", payload);
      }
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("sales.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sale ? t("sales.editSale") : t("sales.addSale")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="sale-form" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      }
    >
      <form
        id="sale-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <VoiceTextInput
          label={t("common.date")}
          type="date"
          value={form.date}
          onChange={(v) => setForm({ ...form, date: v })}
          page="sales"
          fieldName="date"
          trackTextHistory={false}
          required
        />
        <VoiceTextInput
          label={t("sales.clientName")}
          value={form.client}
          onChange={(v) => setForm({ ...form, client: v })}
          page="sales"
          fieldName="clientName"
          placeholder={t("common.optional")}
        />
        <Select
          label={t("sales.greenhouse")}
          value={form.greenhouse}
          onChange={(e) => setForm({ ...form, greenhouse: e.target.value })}
          options={greenhouseOptionsWithNone}
        />
        <Select
          label={t("sales.product")}
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          options={productOptions}
        />
        <VoiceTextInput
          label={t("sales.weight")}
          type="number"
          min="0"
          step="0.01"
          value={form.weight}
          onChange={(v) => setForm({ ...form, weight: v })}
          page="sales"
          fieldName="weight"
          trackTextHistory={false}
          required
        />
        <Select
          label={t("sales.unit")}
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          options={unitOptions}
        />
        <VoiceTextInput
          label={t("sales.pricePerUnit")}
          type="number"
          min="0"
          step="0.01"
          value={form.pricePerUnit}
          onChange={(v) => setForm({ ...form, pricePerUnit: v })}
          page="sales"
          fieldName="pricePerUnit"
          trackTextHistory={false}
          required
        />
        <VoiceTextInput
          label={t("sales.paidAmount")}
          type="number"
          min="0"
          step="0.01"
          value={form.paid}
          onChange={(v) => setForm({ ...form, paid: v })}
          page="sales"
          fieldName="paidAmount"
          trackTextHistory={false}
        />
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("common.notes")}
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            page="sales"
            fieldName="notes"
            placeholder={t("common.optional")}
          />
        </div>
        <div className="sm:col-span-2">
          <MediaProofUpload
            value={mediaProof}
            onChange={(items) => {
              setMediaProof(items);
              if (items.length > 0) setMediaError("");
            }}
            error={mediaError}
            disabled={saving}
          />
        </div>
      </form>
    </Modal>
  );
}
