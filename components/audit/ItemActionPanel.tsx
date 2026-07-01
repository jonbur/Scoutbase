"use client";

import type { AuditItemWithResponse, AuditLinkedAction } from "@/types/audit";

const PRIORITY_LABELS = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
} as const;

const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
} as const;

type ItemActionPanelProps = {
  item: AuditItemWithResponse;
  onAddAction: (item: AuditItemWithResponse) => void;
  onEditAction: (item: AuditItemWithResponse, action: AuditLinkedAction) => void;
  onDeleteAction: (item: AuditItemWithResponse, action: AuditLinkedAction) => void;
  deletingActionId?: string | null;
};

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ItemActionPanel({
  item,
  onAddAction,
  onEditAction,
  onDeleteAction,
  deletingActionId = null,
}: ItemActionPanelProps) {
  const actions = item.actions;

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-medium text-slate-900">Actions</h4>
        <button
          type="button"
          onClick={() => onAddAction(item)}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Add action
        </button>
      </div>

      {actions.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No follow-up actions for this question yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {actions.map((action) => {
            const dueLabel = formatDueDate(action.dueDate);

            return (
              <li
                key={action.id}
                className="rounded-lg border border-slate-200 bg-white px-3 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {action.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {PRIORITY_LABELS[action.priority]} ·{" "}
                      {STATUS_LABELS[action.status]}
                      {dueLabel ? ` · Due ${dueLabel}` : ""}
                    </p>
                    {action.description ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {action.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => onEditAction(item, action)}
                      className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAction(item, action)}
                      disabled={deletingActionId === action.id}
                      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingActionId === action.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
