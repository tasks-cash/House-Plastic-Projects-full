"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
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
import type { MappedEmployee } from "@/lib/mappers";
import { formatDateTime } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  name: "",
  email: "",
  username: "",
  phone: "",
  password: "",
  role: "worker",
  status: "active",
  assignedGreenhouse: "",
  notes: "",
};

export default function EmployeesPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const { employeeRoleOptions, employeeStatusOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const { canWriteModule, canDelete } = usePermissions();
  const canWrite = canWriteModule("employees");
  const [employees, setEmployees] = useState<MappedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MappedEmployee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappedEmployee | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      const data = await apiGet<MappedEmployee[]>(`/api/employees?${params}`);
      setEmployees(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("employees.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, showToast, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadEmployees]);

  const totals = useMemo(() => {
    const active = employees.filter((e) => e.status === "active").length;
    const workers = employees.filter((e) => e.role === "worker").length;
    const tasks = employees.reduce((s, e) => s + (e.dailyTasksCount ?? 0), 0);
    return { active, workers, tasks, count: employees.length };
  }, [employees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/employees/${deleteTarget.id}`);
      showToast(t("toast.deleted"), "success");
      setDeleteTarget(null);
      await loadEmployees();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.deleteFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MappedEmployee>[] = [
    { key: "name", header: t("employees.name") },
    { key: "phone", header: t("employees.phone"), hideOnMobile: true, render: (r) => r.phone || "—" },
    { key: "email", header: t("employees.email"), hideOnMobile: true, render: (r) => r.email || "—" },
    {
      key: "role",
      header: t("employees.role"),
      render: (r) => <Badge variant="info">{enumLabel("employeeRole", r.role)}</Badge>,
    },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <Badge variant={statusToBadgeVariant(r.status)}>
          {enumLabel("employeeStatus", r.status)}
        </Badge>
      ),
    },
    { key: "assignedGreenhouse", header: t("expenses.greenhouse"), hideOnMobile: true },
    {
      key: "dailyTasksCount",
      header: t("employees.tasksToday"),
      render: (r) => (
        <span className="font-medium text-white">{r.dailyTasksCount ?? 0}</span>
      ),
    },
    {
      key: "lastActivity",
      header: t("employees.lastActivity"),
      render: (r) => (r.lastActivity ? formatDateTime(r.lastActivity) : "—"),
      hideOnMobile: true,
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
    <DashboardLayout title={t("employees.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("employees.title")}
          description={t("employees.description")}
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("employees.addEmployee")}
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <VoiceSearchInput
            page="employees"
            value={search}
            onChange={setSearch}
            placeholder={t("employees.searchPlaceholder")}
          />
          <Select
            className="lg:w-44"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder={t("employees.allRoles")}
            options={[{ value: "", label: t("employees.allRoles") }, ...employeeRoleOptions]}
          />
          <Select
            className="lg:w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder={t("employees.allStatuses")}
            options={[{ value: "", label: t("employees.allStatuses") }, ...employeeStatusOptions]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t("employees.totalEmployees")} value={String(totals.count)} />
          <StatCard title={t("employees.active")} value={String(totals.active)} accent />
          <StatCard title={t("employees.workers")} value={String(totals.workers)} />
          <StatCard title={t("employees.tasksToday")} value={String(totals.tasks)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center text-zinc-500">
            {t("employees.empty")} {canWrite && t("employees.emptyHint")}
          </div>
        ) : (
          <DataTable columns={columns} data={employees} keyExtractor={(r) => r.id} />
        )}

        <EmployeeFormModal
          isOpen={modalOpen}
          employee={editing}
          saving={saving}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditing(null);
            showToast(editing ? t("debts.updated") : t("debts.created"), "success");
            await loadEmployees();
          }}
          setSaving={setSaving}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={t("employees.deleteTitle")}
          message={t("employees.deleteMessage", { name: deleteTarget?.name ?? "" })}
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function EmployeeFormModal({
  isOpen,
  employee,
  saving,
  onClose,
  onSaved,
  setSaving,
}: {
  isOpen: boolean;
  employee: MappedEmployee | null;
  saving: boolean;
  onClose: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
}) {
  const t = useTranslations();
  const { employeeRoleOptions, employeeStatusOptions, greenhouseOptionsWithNone } =
    useTranslatedOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (employee) {
      setForm({
        name: employee.name,
        email: employee.email,
        username: employee.username,
        phone: employee.phone,
        password: "",
        role: employee.role,
        status: employee.status,
        assignedGreenhouse: employee.assignedGreenhouse,
        notes: employee.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, employee]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.email.trim() && !form.username.trim() && !form.phone.trim()) {
      showToast(t("employees.identifierError"), "error");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      email: form.email,
      username: form.username,
      phone: form.phone,
      ...(form.password ? { password: form.password } : {}),
      role: form.role,
      status: form.status,
      assignedGreenhouse: form.assignedGreenhouse || undefined,
      notes: form.notes,
    };

    try {
      if (employee) {
        await apiPut(`/api/employees/${employee.id}`, payload);
      } else {
        await apiPost("/api/employees", payload);
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
      title={employee ? t("employees.editEmployee") : t("employees.addEmployee")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="employee-form" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      }
    >
      <form
        id="employee-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <VoiceTextInput
          label={t("employees.name")}
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          page="employees"
          fieldName="name"
          required
        />
        <VoiceTextInput
          label={t("employees.email")}
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          page="employees"
          fieldName="email"
          placeholder={t("common.optional")}
        />
        <VoiceTextInput
          label={t("employees.username")}
          value={form.username}
          onChange={(v) => setForm({ ...form, username: v })}
          page="employees"
          fieldName="username"
          placeholder={t("common.optional")}
        />
        <VoiceTextInput
          label={t("employees.phone")}
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          page="employees"
          fieldName="phone"
          placeholder={t("common.optional")}
        />
        <VoiceTextInput
          label={t("employees.password")}
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          page="employees"
          fieldName="password"
          trackTextHistory={false}
          placeholder={
            employee ? t("employees.passwordKeep") : t("employees.passwordOptional")
          }
        />
        <Select
          label={t("employees.role")}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          options={employeeRoleOptions}
        />
        <Select
          label={t("common.status")}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={employeeStatusOptions}
        />
        <Select
          label={t("employees.assignedGreenhouse")}
          value={form.assignedGreenhouse}
          onChange={(e) => setForm({ ...form, assignedGreenhouse: e.target.value })}
          options={greenhouseOptionsWithNone}
          className="sm:col-span-2"
        />
        <p className="text-xs text-zinc-500 sm:col-span-2">{t("employees.identifierHint")}</p>
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("common.notes")}
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            page="employees"
            fieldName="notes"
            placeholder={t("employees.notesPlaceholder")}
          />
        </div>
      </form>
    </Modal>
  );
}
