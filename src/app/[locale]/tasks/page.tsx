"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
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
import type { MappedEmployee, MappedTask } from "@/lib/mappers";
import { formatDateTime } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

function isoToDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

const defaultDueTime = () => isoToDatetimeLocal(new Date().toISOString());

const emptyForm = {
  title: "",
  description: "",
  assignedTo: "",
  assignedToId: "",
  greenhouse: "GH-A",
  priority: "medium",
  status: "pending",
  dueTime: defaultDueTime(),
};

export default function TasksPage() {
  const t = useTranslations();
  const enumLabel = useEnumLabel();
  const { taskPriorityOptions, taskStatusOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const { canWriteModule, canDelete } = usePermissions();
  const canWrite = canWriteModule("tasks");
  const [tasks, setTasks] = useState<MappedTask[]>([]);
  const [employees, setEmployees] = useState<MappedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MappedTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappedTask | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    try {
      const data = await apiGet<MappedEmployee[]>("/api/employees");
      setEmployees(data);
    } catch {
      // Employee list is optional for viewing tasks
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      const data = await apiGet<MappedTask[]>(`/api/tasks?${params}`);
      setTasks(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("tasks.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, showToast, t]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((e) => e.status === "active")
        .map((e) => ({ value: e.name, label: e.name, id: e.id })),
    [employees]
  );

  const filteredTasks = useMemo(() => {
    if (!employeeFilter) return tasks;
    return tasks.filter((task) => task.assignedTo === employeeFilter);
  }, [tasks, employeeFilter]);

  const totals = useMemo(() => {
    const pending = filteredTasks.filter((task) => task.status === "pending").length;
    const inProgress = filteredTasks.filter((task) => task.status === "in_progress").length;
    const done = filteredTasks.filter((task) => task.status === "done").length;
    const late = filteredTasks.filter((task) => task.status === "late").length;
    return { pending, inProgress, done, late, count: filteredTasks.length };
  }, [filteredTasks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/tasks/${deleteTarget.id}`);
      showToast(t("toast.deleted"), "success");
      setDeleteTarget(null);
      await loadTasks();
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.deleteFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MappedTask>[] = [
    { key: "title", header: t("tasks.titleField") },
    { key: "assignedTo", header: t("tasks.assignedTo") },
    { key: "greenhouse", header: t("expenses.greenhouse"), hideOnMobile: true },
    {
      key: "priority",
      header: t("tasks.priority"),
      render: (r) => (
        <Badge variant={statusToBadgeVariant(r.priority)}>
          {enumLabel("taskPriority", r.priority)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <Badge variant={statusToBadgeVariant(r.status)}>
          {enumLabel("taskStatus", r.status)}
        </Badge>
      ),
    },
    {
      key: "dueTime",
      header: t("tasks.dueTime"),
      render: (r) => formatDateTime(r.dueTime),
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
    <DashboardLayout title={t("tasks.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("tasks.title")}
          description={t("tasks.description")}
          actions={
            canWrite ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("tasks.addTask")}
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <VoiceSearchInput
            page="tasks"
            value={search}
            onChange={setSearch}
            placeholder={t("tasks.searchPlaceholder")}
          />
          <Select
            className="lg:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder={t("tasks.allStatuses")}
            options={[{ value: "", label: t("tasks.allStatuses") }, ...taskStatusOptions]}
          />
          <Select
            className="lg:w-40"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            placeholder={t("tasks.allPriorities")}
            options={[{ value: "", label: t("tasks.allPriorities") }, ...taskPriorityOptions]}
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
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <StatCard title={t("sales.records")} value={String(totals.count)} />
          <StatCard title={t("tasks.pending")} value={String(totals.pending)} />
          <StatCard title={t("tasks.inProgress")} value={String(totals.inProgress)} accent />
          <StatCard title={t("tasks.completed")} value={String(totals.done)} />
          <StatCard title={t("tasks.overdue")} value={String(totals.late)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center text-zinc-500">
            {t("tasks.empty")} {canWrite && t("tasks.emptyHint")}
          </div>
        ) : (
          <DataTable columns={columns} data={filteredTasks} keyExtractor={(r) => r.id} />
        )}

        <TaskFormModal
          isOpen={modalOpen}
          task={editing}
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
            await loadTasks();
          }}
          setSaving={setSaving}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={t("tasks.deleteTitle")}
          message={t("tasks.deleteMessage", { title: deleteTarget?.title ?? "" })}
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </DashboardLayout>
  );
}

function TaskFormModal({
  isOpen,
  task,
  saving,
  employeeOptions,
  onClose,
  onSaved,
  setSaving,
}: {
  isOpen: boolean;
  task: MappedTask | null;
  saving: boolean;
  employeeOptions: { value: string; label: string; id: string }[];
  onClose: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
}) {
  const t = useTranslations();
  const { greenhouseOptions, taskPriorityOptions, taskStatusOptions } = useTranslatedOptions();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      const match = employeeOptions.find((e) => e.value === task.assignedTo);
      setForm({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assignedToId: match?.id ?? "",
        greenhouse: task.greenhouse,
        priority: task.priority,
        status: task.status,
        dueTime: isoToDatetimeLocal(task.dueTime),
      });
    } else {
      setForm({ ...emptyForm, dueTime: defaultDueTime() });
    }
  }, [isOpen, task, employeeOptions]);

  const handleAssigneeChange = (name: string) => {
    const match = employeeOptions.find((e) => e.value === name);
    setForm({
      ...form,
      assignedTo: name,
      assignedToId: match?.id ?? "",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      assignedTo: form.assignedTo,
      greenhouse: form.greenhouse,
      priority: form.priority,
      status: form.status,
      dueTime: datetimeLocalToIso(form.dueTime),
    };
    if (form.assignedToId) {
      payload.assignedToId = form.assignedToId;
    }

    try {
      if (task) {
        await apiPut(`/api/tasks/${task.id}`, payload);
      } else {
        await apiPost("/api/tasks", payload);
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
      title={task ? t("tasks.editTask") : t("tasks.addTask")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="task-form" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      }
    >
      <form
        id="task-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <VoiceTextInput
          label={t("tasks.titleField")}
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          page="tasks"
          fieldName="title"
          className="sm:col-span-2"
          required
        />
        <div className="sm:col-span-2">
          <VoiceTextarea
            label={t("tasks.descriptionLabel")}
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            page="tasks"
            fieldName="description"
            placeholder={t("tasks.descriptionPlaceholder")}
          />
        </div>
        <Select
          label={t("tasks.assignedTo")}
          value={form.assignedTo}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          placeholder={t("tasks.selectEmployee")}
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
          label={t("tasks.priority")}
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          options={taskPriorityOptions}
        />
        <Select
          label={t("common.status")}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={taskStatusOptions}
        />
        <Input
          label={t("tasks.dueTime")}
          type="datetime-local"
          value={form.dueTime}
          onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
          className="sm:col-span-2"
          required
        />
      </form>
    </Modal>
  );
}
