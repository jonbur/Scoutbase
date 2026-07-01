"use client";

import { useState } from "react";
import type { Priority } from "@prisma/client";
import type { AuditItemWithResponse } from "@/types/audit";
import { Button } from "@/components/ui/form";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

type ActionRaiseFormProps = {
  item: AuditItemWithResponse;
  saving: boolean;
  onSubmit: (input: {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function ActionRaiseForm({
  item,
  saving,
  onSubmit,
  onCancel,
}: ActionRaiseFormProps) {
  const [title, setTitle] = useState(item.question);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to raise action",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">Raise action</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create a follow-up task from this audit question.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="action-title" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="action-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="action-description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="action-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700">Priority</span>
            <div className="mt-2 flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    priority === option.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="action-due" className="block text-sm font-medium text-slate-700">
              Target date (optional)
            </label>
            <input
              id="action-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create action"}
          </Button>
        </div>
      </form>
    </div>
  );
}
