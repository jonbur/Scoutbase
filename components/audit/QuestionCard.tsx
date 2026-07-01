"use client";

import type { ResponseValue } from "@prisma/client";
import type { AuditItemWithResponse } from "@/types/audit";
import { ResponseInput } from "@/components/audit/ResponseInput";

type QuestionCardProps = {
  item: AuditItemWithResponse;
  saving: boolean;
  onResponseChange: (itemId: string, response: ResponseValue, notes?: string) => void;
  onRaiseAction: (item: AuditItemWithResponse) => void;
  hasAction: boolean;
};

export function QuestionCard({
  item,
  saving,
  onResponseChange,
  onRaiseAction,
  hasAction,
}: QuestionCardProps) {
  const currentResponse = item.response?.response ?? null;
  const notes = item.response?.notes ?? "";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-medium text-slate-900">{item.question}</h3>
      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        {item.guidance}
      </p>

      <div className="mt-4">
        <ResponseInput
          value={currentResponse}
          disabled={saving}
          onChange={(response) => onResponseChange(item.id, response, notes)}
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor={`notes-${item.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Notes (optional)
        </label>
        <textarea
          id={`notes-${item.id}`}
          rows={2}
          defaultValue={notes}
          disabled={saving}
          onBlur={(event) => {
            if (currentResponse) {
              onResponseChange(item.id, currentResponse, event.target.value);
            }
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 disabled:opacity-50"
          placeholder="Add any observations or evidence references"
        />
      </div>

      {(currentResponse === "ACTION_NEEDED" || hasAction) && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            {hasAction
              ? "An action has been raised for this item."
              : "This item needs a follow-up action."}
          </p>
          {!hasAction ? (
            <button
              type="button"
              onClick={() => onRaiseAction(item)}
              className="shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
            >
              Raise action
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
