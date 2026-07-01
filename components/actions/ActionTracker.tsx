"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ActionStatus, Priority } from "@prisma/client";
import { ActionForm } from "@/components/audit/ActionRaiseForm";
import type { AuditLinkedAction } from "@/types/audit";
import {
  ACTION_PRIORITY_LABELS,
  ACTION_SOURCE_LABELS,
  ACTION_STATUS_LABELS,
  DEFAULT_ACTION_FILTERS,
  type ActionListFilters,
  type ActionListItem,
} from "@/types/action";

type ActionTrackerProps = {
  premisesId: string;
};

type ActionSummary = {
  total: number;
  open: number;
  inProgress: number;
  overdue: number;
};

function formatDisplayDate(value: string | null): string {
  if (!value) return "No due date";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function filtersToQuery(filters: ActionListFilters): string {
  const params = new URLSearchParams();
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.priority !== "ALL") params.set("priority", filters.priority);
  if (filters.due !== "all") params.set("due", filters.due);
  if (filters.dueBefore) params.set("dueBefore", filters.dueBefore);
  if (filters.dueAfter) params.set("dueAfter", filters.dueAfter);
  return params.toString();
}

function parseFiltersFromSearch(searchParams: URLSearchParams): ActionListFilters {
  return {
    status: (searchParams.get("status") || "ALL") as ActionListFilters["status"],
    priority: (searchParams.get("priority") || "ALL") as ActionListFilters["priority"],
    due: (searchParams.get("due") || "all") as ActionListFilters["due"],
    dueBefore: searchParams.get("dueBefore") || "",
    dueAfter: searchParams.get("dueAfter") || "",
  };
}

function toLinkedAction(action: ActionListItem): AuditLinkedAction {
  return {
    id: action.id,
    title: action.title,
    description: action.description,
    priority: action.priority,
    dueDate: action.dueDate,
    status: action.status,
  };
}

export function ActionTracker({ premisesId }: ActionTrackerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ActionListFilters>(() =>
    parseFiltersFromSearch(searchParams),
  );
  const [actions, setActions] = useState<ActionListItem[]>([]);
  const [summary, setSummary] = useState<ActionSummary>({
    total: 0,
    open: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<ActionListItem | null>(null);
  const [savingAction, setSavingAction] = useState(false);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);

  const loadActions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = filtersToQuery(filters);
      const response = await fetch(
        `/api/premises/${premisesId}/actions${query ? `?${query}` : ""}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load actions");
      }

      setActions(result.data.actions);
      setSummary(result.data.summary);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load actions",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, premisesId]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  function applyFilters(next: ActionListFilters) {
    setFilters(next);
    const query = filtersToQuery(next);
    router.replace(
      `/premises/${premisesId}/actions${query ? `?${query}` : ""}`,
      { scroll: false },
    );
  }

  function resetFilters() {
    applyFilters(DEFAULT_ACTION_FILTERS);
  }

  async function handleSaveAction(input: {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
    status?: ActionStatus;
  }) {
    if (!editingAction) return;

    setSavingAction(true);
    setError(null);

    try {
      const response = await fetch(`/api/actions/${editingAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          description: input.description || null,
          priority: input.priority,
          dueDate: input.dueDate || null,
          status: input.status,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to save action");
      }

      setEditingAction(null);
      await loadActions();
    } finally {
      setSavingAction(false);
    }
  }

  async function handleDeleteAction(action: ActionListItem) {
    if (!window.confirm(`Delete action "${action.title}"?`)) {
      return;
    }

    setDeletingActionId(action.id);
    setError(null);

    try {
      const response = await fetch(`/api/actions/${action.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete action");
      }

      await loadActions();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete action",
      );
    } finally {
      setDeletingActionId(null);
    }
  }

  async function handleQuickStatusChange(
    action: ActionListItem,
    status: ActionStatus,
  ) {
    setError(null);

    try {
      const response = await fetch(`/api/actions/${action.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: action.title,
          description: action.description,
          priority: action.priority,
          dueDate: action.dueDate,
          status,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update status");
      }

      await loadActions();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Failed to update status",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total" value={summary.total} />
        <SummaryCard label="Open" value={summary.open} />
        <SummaryCard label="In progress" value={summary.inProgress} />
        <SummaryCard label="Overdue" value={summary.overdue} tone="warning" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FilterField label="Status">
            <select
              value={filters.status}
              onChange={(event) =>
                applyFilters({
                  ...filters,
                  status: event.target.value as ActionListFilters["status"],
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </FilterField>

          <FilterField label="Priority">
            <select
              value={filters.priority}
              onChange={(event) =>
                applyFilters({
                  ...filters,
                  priority: event.target.value as ActionListFilters["priority"],
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="ALL">All priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </FilterField>

          <FilterField label="Due date">
            <select
              value={filters.due}
              onChange={(event) =>
                applyFilters({
                  ...filters,
                  due: event.target.value as ActionListFilters["due"],
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">Any due date</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
              <option value="none">No due date</option>
            </select>
          </FilterField>

          <FilterField label="Due on or before">
            <input
              type="date"
              value={filters.dueBefore}
              onChange={(event) =>
                applyFilters({ ...filters, dueBefore: event.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </FilterField>

          <FilterField label="Due on or after">
            <input
              type="date"
              value={filters.dueAfter}
              onChange={(event) =>
                applyFilters({ ...filters, dueAfter: event.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </FilterField>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading actions…</p>
      ) : actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">
            No actions match your filters.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Actions raised during an audit will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <article
              key={action.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-slate-900">
                      {action.title}
                    </h3>
                    {action.isOverdue ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        Overdue
                      </span>
                    ) : null}
                  </div>
                  {action.description ? (
                    <p className="mt-2 text-sm text-slate-600">
                      {action.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {ACTION_PRIORITY_LABELS[action.priority]} priority ·{" "}
                    {action.sourceType
                      ? ACTION_SOURCE_LABELS[action.sourceType]
                      : "Unknown source"}{" "}
                    · Due {formatDisplayDate(action.dueDate)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={action.status}
                    onChange={(event) =>
                      handleQuickStatusChange(
                        action,
                        event.target.value as ActionStatus,
                      )
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  >
                    {Object.entries(ACTION_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setEditingAction(action)}
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAction(action)}
                    disabled={deletingActionId === action.id}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingActionId === action.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingAction ? (
        <ActionTrackerEditModal
          action={editingAction}
          saving={savingAction}
          onSubmit={handleSaveAction}
          onCancel={() => setEditingAction(null)}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          tone === "warning" ? "text-red-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ActionTrackerEditModal({
  action,
  saving,
  onSubmit,
  onCancel,
}: {
  action: ActionListItem;
  saving: boolean;
  onSubmit: (input: {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
    status?: ActionStatus;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const stubItem = {
    id: action.sourceItemId ?? action.id,
    question: action.title,
    guidance: "",
    responseType: "YES_NO_NA_ACTION" as const,
    requiresDocument: false,
    response: null,
    actions: [],
  };

  return (
    <ActionForm
      item={stubItem}
      existingAction={toLinkedAction(action)}
      saving={saving}
      showStatus
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
