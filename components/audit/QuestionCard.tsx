"use client";

import { useEffect, useRef, useState } from "react";
import type { AuditItemWithResponse } from "@/types/audit";
import {
  isPrimaryResponse,
  ResponseInput,
  type PrimaryResponseValue,
} from "@/components/audit/ResponseInput";
import { DateField, ToggleField } from "@/components/ui/form";
import { formatInputDate, isInputDate } from "@/lib/dates";
import {
  isDateUploadItem,
  isOpenTextItem,
} from "@/types/audit-template";

export type QuestionSavePayload = {
  response: PrimaryResponseValue | "NA";
  needsAction: boolean;
  notes: string;
  recordedDate?: string | null;
};

type QuestionCardProps = {
  item: AuditItemWithResponse;
  sectionId: string;
  saving: boolean;
  variant?: "default" | "sub";
  onSave: (
    itemId: string,
    sectionId: string,
    payload: QuestionSavePayload,
  ) => Promise<void>;
  onRaiseAction: (item: AuditItemWithResponse) => void;
  onEditAction: (item: AuditItemWithResponse) => void;
};

function normalizeStoredResponse(item: AuditItemWithResponse) {
  const stored = item.response;

  if (isDateUploadItem(item)) {
    return {
      response: null as PrimaryResponseValue | null,
      needsAction: false,
      notes: "",
      recordedDate: formatInputDate(stored?.recordedDate),
    };
  }

  if (isOpenTextItem(item)) {
    return {
      response: null as PrimaryResponseValue | null,
      needsAction: false,
      notes: stored?.notes ?? "",
      recordedDate: "",
    };
  }

  if (!stored) {
    return {
      response: null as PrimaryResponseValue | null,
      needsAction: false,
      notes: "",
      recordedDate: "",
    };
  }

  if (stored.response === "ACTION_NEEDED") {
    return {
      response: null as PrimaryResponseValue | null,
      needsAction: true,
      notes: stored.notes ?? "",
      recordedDate: "",
    };
  }

  return {
    response: isPrimaryResponse(stored.response) ? stored.response : null,
    needsAction: stored.needsAction,
    notes: stored.notes ?? "",
    recordedDate: "",
  };
}

function canSave(item: AuditItemWithResponse, payload: QuestionSavePayload): string | null {
  if (isDateUploadItem(item)) {
    if (!payload.recordedDate?.trim() || !isInputDate(payload.recordedDate)) {
      return "Please select a date before saving.";
    }
    return null;
  }

  if (isOpenTextItem(item)) {
    if (!payload.notes.trim()) {
      return "Please provide an answer before saving.";
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
    item.response.recordedDate ?? "",
  ].join(":");
}

export function QuestionCard({
  item,
  sectionId,
  saving,
  variant = "default",
  onSave,
  onRaiseAction,
  onEditAction,
}: QuestionCardProps) {
  const initial = normalizeStoredResponse(item);
  const [response, setResponse] = useState<PrimaryResponseValue | null>(
    initial.response,
  );
  const [needsAction, setNeedsAction] = useState(initial.needsAction);
  const [notes, setNotes] = useState(initial.notes);
  const [recordedDate, setRecordedDate] = useState(initial.recordedDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({
    response: initial.response,
    needsAction: initial.needsAction,
    notes: initial.notes,
    recordedDate: initial.recordedDate,
  });
  const onSaveRef = useRef(onSave);
  const itemRef = useRef(item);
  const inputFocusedRef = useRef(false);

  const isOpenTextQuestion = isOpenTextItem(item);
  const isDateQuestion = isDateUploadItem(item);
  const linkedAction = item.action;

  stateRef.current = { response, needsAction, notes, recordedDate };
  onSaveRef.current = onSave;
  itemRef.current = item;

  const responseKey = storedResponseKey(item);

  useEffect(() => {
    const next = normalizeStoredResponse(item);
    setResponse(next.response);
    setNeedsAction(next.needsAction);
    if (!inputFocusedRef.current) {
      setNotes(next.notes);
      setRecordedDate(next.recordedDate);
    }
    setValidationError(null);
  }, [item.id, responseKey]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      const currentItem = itemRef.current;
      const current = stateRef.current;
      let payload: QuestionSavePayload | null = null;

      if (isDateUploadItem(currentItem)) {
        if (current.recordedDate.trim() && isInputDate(current.recordedDate)) {
          payload = {
            response: "NA",
            needsAction: false,
            notes: "",
            recordedDate: current.recordedDate,
          };
        }
      } else if (isOpenTextItem(currentItem)) {
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
        void onSaveRef.current(currentItem.id, sectionId, payload);
      }
    };
  }, [item.id, sectionId]);

  const showNeedsAction = !isOpenTextQuestion && !isDateQuestion && (response === "YES" || response === "NO");
  const showYesDetails = !isOpenTextQuestion && !isDateQuestion && response === "YES";

  async function persist(next: QuestionSavePayload) {
    const error = canSave(item, next);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    await onSave(item.id, sectionId, next);
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
    scheduleSave({ response: "NA", needsAction: false, notes: value });
  }

  function handleDateChange(value: string) {
    setRecordedDate(value);
    scheduleSave({
      response: "NA",
      needsAction: false,
      notes: "",
      recordedDate: value,
    });
  }

  function handleInputFocus() {
    inputFocusedRef.current = true;
  }

  async function handleNotesBlur() {
    inputFocusedRef.current = false;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (isOpenTextQuestion) {
      await persist({ response: "NA", needsAction: false, notes });
      return;
    }

    if (response !== "YES") return;
    await persist({ response, needsAction, notes });
  }

  async function handleDateBlur() {
    inputFocusedRef.current = false;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!isDateQuestion) return;
    await persist({
      response: "NA",
      needsAction: false,
      notes: "",
      recordedDate,
    });
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

      {isDateQuestion ? (
        <div className="mt-4">
          <DateField
            id={`date-${item.id}`}
            label="Date"
            value={recordedDate}
            required
            description="Document upload will be added in a later step."
            onChange={handleDateChange}
            onFocus={handleInputFocus}
            onBlur={handleDateBlur}
          />
        </div>
      ) : isOpenTextQuestion ? (
        <div className="mt-4">
          <label
            htmlFor={`notes-${item.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Your answer <span className="text-red-600">*</span>
          </label>
          <textarea
            id={`notes-${item.id}`}
            rows={3}
            value={notes}
            onChange={(event) => handleNotesChange(event.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleNotesBlur}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            placeholder="Type your answer here"
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
                onFocus={handleInputFocus}
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

      {(needsAction || linkedAction) && response && response !== "NA" && !isOpenTextQuestion && !isDateQuestion ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            {linkedAction
              ? "An action has been raised for this item."
              : "Raise an action to track the follow-up."}
          </p>
          {linkedAction ? (
            <button
              type="button"
              onClick={() => onEditAction(item)}
              className="shrink-0 text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950"
            >
              Edit action
            </button>
          ) : needsAction ? (
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
