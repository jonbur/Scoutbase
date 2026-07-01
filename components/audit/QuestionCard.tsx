"use client";

import { useEffect, useState } from "react";
import type { AuditItemWithResponse } from "@/types/audit";
import {
  isPrimaryResponse,
  ResponseInput,
  type PrimaryResponseValue,
} from "@/components/audit/ResponseInput";
import { ToggleField } from "@/components/ui/form";

export type QuestionSavePayload = {
  response: PrimaryResponseValue;
  needsAction: boolean;
  notes: string;
};

type QuestionCardProps = {
  item: AuditItemWithResponse;
  saving: boolean;
  onSave: (itemId: string, payload: QuestionSavePayload) => Promise<void>;
  onRaiseAction: (item: AuditItemWithResponse) => void;
  hasAction: boolean;
};

function normalizeStoredResponse(item: AuditItemWithResponse) {
  const stored = item.response;

  if (!stored) {
    return { response: null as PrimaryResponseValue | null, needsAction: false, notes: "" };
  }

  if (stored.response === "ACTION_NEEDED") {
    return {
      response: null as PrimaryResponseValue | null,
      needsAction: true,
      notes: stored.notes ?? "",
    };
  }

  return {
    response: isPrimaryResponse(stored.response) ? stored.response : null,
    needsAction: stored.needsAction,
    notes: stored.notes ?? "",
  };
}

function canSave(payload: QuestionSavePayload): string | null {
  if (payload.response === "YES" && !payload.notes.trim()) {
    return "Provide details is required when you answer Yes.";
  }
  return null;
}

export function QuestionCard({
  item,
  saving,
  onSave,
  onRaiseAction,
  hasAction,
}: QuestionCardProps) {
  const initial = normalizeStoredResponse(item);
  const [response, setResponse] = useState<PrimaryResponseValue | null>(
    initial.response,
  );
  const [needsAction, setNeedsAction] = useState(initial.needsAction);
  const [notes, setNotes] = useState(initial.notes);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const next = normalizeStoredResponse(item);
    setResponse(next.response);
    setNeedsAction(next.needsAction);
    setNotes(next.notes);
    setValidationError(null);
  }, [item]);

  const showNeedsAction = response === "YES" || response === "NO";
  const showDetails = response === "YES";

  async function persist(next: QuestionSavePayload) {
    const error = canSave(next);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    await onSave(item.id, next);
  }

  async function handleResponseChange(nextResponse: PrimaryResponseValue) {
    const next: QuestionSavePayload = {
      response: nextResponse,
      needsAction: nextResponse === "NA" ? false : needsAction,
      notes: nextResponse === "YES" ? notes : "",
    };

    setResponse(nextResponse);
    if (nextResponse === "NA") {
      setNeedsAction(false);
      setNotes("");
    } else if (nextResponse === "NO") {
      setNotes("");
    }

    if (nextResponse === "YES") {
      setValidationError(null);
      return;
    }

    await persist(next);
  }

  async function handleNeedsActionChange(checked: boolean) {
    if (!response || response === "NA") return;

    const next = { response, needsAction: checked, notes };
    setNeedsAction(checked);
    await persist(next);
  }

  async function handleNotesBlur() {
    if (response !== "YES") return;
    await persist({ response, needsAction, notes });
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-medium text-slate-900">{item.question}</h3>
      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
        {item.guidance}
      </p>

      <div className="mt-4">
        <ResponseInput
          value={response}
          disabled={saving}
          onChange={handleResponseChange}
        />
      </div>

      {showDetails ? (
        <div className="mt-4">
          <label
            htmlFor={`notes-${item.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Provide details <span className="text-red-600">*</span>
          </label>
          <textarea
            id={`notes-${item.id}`}
            rows={3}
            value={notes}
            disabled={saving}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={handleNotesBlur}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 disabled:opacity-50"
            placeholder="Describe what is in place, any evidence, or context for your answer"
          />
        </div>
      ) : null}

      {showNeedsAction ? (
        <div className="mt-4">
          <ToggleField
            label="Needs action"
            description="Tick if a follow-up task should be tracked for this item."
            checked={needsAction}
            onChange={handleNeedsActionChange}
          />
        </div>
      ) : null}

      {validationError ? (
        <p className="mt-3 text-sm text-red-600">{validationError}</p>
      ) : null}

      {(needsAction || hasAction) && response && response !== "NA" ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            {hasAction
              ? "An action has been raised for this item."
              : "Raise an action to track the follow-up."}
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
      ) : null}
    </article>
  );
}
