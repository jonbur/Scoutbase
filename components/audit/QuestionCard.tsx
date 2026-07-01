"use client";

import { useEffect, useRef, useState } from "react";
import type { AuditItemWithResponse } from "@/types/audit";
import {
  isPrimaryResponse,
  ResponseInput,
  type PrimaryResponseValue,
} from "@/components/audit/ResponseInput";
import { ToggleField } from "@/components/ui/form";
import { isTextAnswerItem, isDateUploadItem } from "@/types/audit-template";

export type QuestionSavePayload = {
  response: PrimaryResponseValue | "NA";
  needsAction: boolean;
  notes: string;
};

type QuestionCardProps = {
  item: AuditItemWithResponse;
  saving: boolean;
  variant?: "default" | "sub";
  onSave: (itemId: string, payload: QuestionSavePayload) => Promise<void>;
  onRaiseAction: (item: AuditItemWithResponse) => void;
  hasAction: boolean;
};

function normalizeStoredResponse(item: AuditItemWithResponse) {
  const stored = item.response;

  if (isTextAnswerItem(item)) {
    return {
      response: null as PrimaryResponseValue | null,
      needsAction: false,
      notes: stored?.notes ?? "",
    };
  }

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

function canSave(item: AuditItemWithResponse, payload: QuestionSavePayload): string | null {
  if (isTextAnswerItem(item)) {
    if (!payload.notes.trim()) {
      return isDateUploadItem(item)
        ? "Please enter the date or details before saving."
        : "Please provide an answer before saving.";
    }
    return null;
  }

  if (payload.response === "YES" && !payload.notes.trim()) {
    return "Provide details is required when you answer Yes.";
  }

  return null;
}

function storedResponseKey(item: AuditItemWithResponse): string {
  if (!item.response) {
    return "none";
  }

  return [
    item.response.id,
    item.response.response,
    item.response.needsAction,
    item.response.notes ?? "",
  ].join(":");
}

export function QuestionCard({
  item,
  saving,
  variant = "default",
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({ response: initial.response, needsAction: initial.needsAction, notes: initial.notes });
  const onSaveRef = useRef(onSave);
  const itemRef = useRef(item);
  const notesFocusedRef = useRef(false);

  const isTextQuestion = isTextAnswerItem(item);
  const isDateQuestion = isDateUploadItem(item);

  stateRef.current = { response, needsAction, notes };
  onSaveRef.current = onSave;
  itemRef.current = item;

  useEffect(() => {
    const next = normalizeStoredResponse(item);
    setResponse(next.response);
    setNeedsAction(next.needsAction);
    if (!notesFocusedRef.current) {
      setNotes(next.notes);
    }
    setValidationError(null);
  }, [item.id, storedResponseKey(item)]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const currentItem = itemRef.current;
      const current = stateRef.current;
      let payload: QuestionSavePayload | null = null;

      if (isTextAnswerItem(currentItem)) {
        if (current.notes.trim()) {
          payload = { response: "NA", needsAction: false, notes: current.notes };
        }
      } else if (current.response === "YES" && current.notes.trim()) {
        payload = {
          response: "YES",
          needsAction: current.needsAction,
          notes: current.notes,
        };
      } else if (current.response === "NO") {
        payload = {
          response: "NO",
          needsAction: current.needsAction,
          notes: "",
        };
      } else if (current.response === "NA") {
        payload = { response: "NA", needsAction: false, notes: "" };
      }

      if (payload && canSave(currentItem, payload) === null) {
        void onSaveRef.current(currentItem.id, payload);
      }
    };
  }, [item.id]);

  const showNeedsAction = !isTextQuestion && (response === "YES" || response === "NO");
  const showYesDetails = !isTextQuestion && response === "YES";

  async function persist(next: QuestionSavePayload) {
    const error = canSave(item, next);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    await onSave(item.id, next);
  }

  function scheduleSave(next: QuestionSavePayload) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (canSave(item, next) !== null) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      void persist(next);
    }, 800);
  }

  async function handleResponseChange(nextResponse: PrimaryResponseValue) {
    const nextNotes = nextResponse === "YES" ? notes : "";
    const nextNeedsAction = nextResponse === "NA" ? false : needsAction;

    setResponse(nextResponse);

    if (nextResponse === "NA") {
      setNeedsAction(false);
      setNotes("");
      await persist({ response: "NA", needsAction: false, notes: "" });
      return;
    }

    if (nextResponse === "NO") {
      setNotes("");
      await persist({ response: "NO", needsAction: nextNeedsAction, notes: "" });
      return;
    }

    setValidationError(null);

    if (nextNotes.trim()) {
      await persist({
        response: "YES",
        needsAction: nextNeedsAction,
        notes: nextNotes,
      });
    }
  }

  async function handleNeedsActionChange(checked: boolean) {
    if (!response || response === "NA") return;

    const next = { response, needsAction: checked, notes };
    setNeedsAction(checked);
    await persist(next);
  }

  function handleNotesChange(value: string) {
    setNotes(value);

    if (isTextQuestion) {
      scheduleSave({ response: "NA", needsAction: false, notes: value });
      return;
    }

    if (response === "YES") {
      scheduleSave({ response: "YES", needsAction, notes: value });
    }
  }

  function handleNotesFocus() {
    notesFocusedRef.current = true;
  }

  async function handleNotesBlur() {
    notesFocusedRef.current = false;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (isTextQuestion) {
      await persist({ response: "NA", needsAction: false, notes });
      return;
    }

    if (response !== "YES") return;
    await persist({ response, needsAction, notes });
  }

  const isSubQuestion = variant === "sub";

  return (
    <article
      className={
        isSubQuestion
          ? "rounded-lg border border-slate-200 bg-slate-50/70 p-4"
          : "rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <h3
        className={
          isSubQuestion
            ? "text-sm font-medium text-slate-900"
            : "text-base font-medium text-slate-900"
        }
      >
        {item.question}
      </h3>
      {item.guidance ? (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {item.guidance}
        </p>
      ) : null}

      {isTextQuestion ? (
        <div className="mt-4">
          <label
            htmlFor={`notes-${item.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            {isDateQuestion ? "Date / details" : "Your answer"}{" "}
            <span className="text-red-600">*</span>
          </label>
          {isDateQuestion ? (
            <p className="mt-1 text-sm text-slate-500">
              Enter the inspection or issue date. Document upload will be added
              in a later step.
            </p>
          ) : null}
          <textarea
            id={`notes-${item.id}`}
            rows={3}
            value={notes}
            onChange={(event) => handleNotesChange(event.target.value)}
            onFocus={handleNotesFocus}
            onBlur={handleNotesBlur}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder={
              isDateQuestion
                ? "e.g. 12 March 2025 — certificate on file in the document vault"
                : "Type your answer here"
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <ResponseInput
              value={response}
              disabled={saving}
              onChange={handleResponseChange}
            />
          </div>

          {showYesDetails ? (
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
                onChange={(event) => handleNotesChange(event.target.value)}
                onFocus={handleNotesFocus}
                onBlur={handleNotesBlur}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
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
        </>
      )}

      {validationError ? (
        <p className="mt-3 text-sm text-red-600">{validationError}</p>
      ) : null}

      {(needsAction || hasAction) && response && response !== "NA" && !isTextQuestion ? (
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
