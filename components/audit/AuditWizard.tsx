"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Priority } from "@prisma/client";
import type { QuestionSavePayload } from "@/components/audit/QuestionCard";
import { ActionForm } from "@/components/audit/ActionRaiseForm";
import { QuestionCard } from "@/components/audit/QuestionCard";
import { QuestionGroupCard } from "@/components/audit/QuestionGroupCard";
import { SectionNav } from "@/components/audit/SectionNav";
import type {
  AuditItemWithResponse,
  AuditLinkedAction,
  AuditOverview,
  AuditSectionItem,
  AuditSectionPayload,
} from "@/types/audit";

type AuditWizardProps = {
  premisesId: string;
  auditId: string;
  initialOverview: AuditOverview;
  initialSectionId: string;
};

type ActionDialogState = {
  item: AuditItemWithResponse;
  existingAction: AuditLinkedAction | null;
};

function updateSectionItemResponse(
  items: AuditSectionItem[],
  itemId: string,
  response: NonNullable<AuditItemWithResponse["response"]>,
): AuditSectionItem[] {
  return items.map((entry) => {
    if (entry.kind === "atomic" && entry.item.id === itemId) {
      return {
        ...entry,
        item: {
          ...entry.item,
          response,
        },
      };
    }

    if (entry.kind === "group") {
      const subQuestionIndex = entry.subQuestions.findIndex(
        (subQuestion) => subQuestion.id === itemId,
      );

      if (subQuestionIndex === -1) {
        return entry;
      }

      const subQuestions = [...entry.subQuestions];
      subQuestions[subQuestionIndex] = {
        ...subQuestions[subQuestionIndex],
        response,
      };

      return {
        ...entry,
        subQuestions,
      };
    }

    return entry;
  });
}

function updateSectionItemActions(
  items: AuditSectionItem[],
  itemId: string,
  actions: AuditLinkedAction[],
): AuditSectionItem[] {
  return items.map((entry) => {
    if (entry.kind === "atomic" && entry.item.id === itemId) {
      return {
        ...entry,
        item: {
          ...entry.item,
          actions,
        },
      };
    }

    if (entry.kind === "group") {
      const subQuestionIndex = entry.subQuestions.findIndex(
        (subQuestion) => subQuestion.id === itemId,
      );

      if (subQuestionIndex === -1) {
        return entry;
      }

      const subQuestions = [...entry.subQuestions];
      subQuestions[subQuestionIndex] = {
        ...subQuestions[subQuestionIndex],
        actions,
      };

      return {
        ...entry,
        subQuestions,
      };
    }

    return entry;
  });
}

export function AuditWizard({
  premisesId,
  auditId,
  initialOverview,
  initialSectionId,
}: AuditWizardProps) {
  const router = useRouter();
  const [overview, setOverview] = useState(initialOverview);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [sectionData, setSectionData] = useState<AuditSectionPayload | null>(null);
  const [loadingSection, setLoadingSection] = useState(true);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<ActionDialogState | null>(null);
  const [savingAction, setSavingAction] = useState(false);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshOverview = useCallback(async () => {
    const response = await fetch(`/api/audit/${auditId}`);
    const result = await response.json();
    if (response.ok && result.data) {
      setOverview(result.data);
    }
  }, [auditId]);

  const loadSection = useCallback(async (sectionId: string) => {
    setLoadingSection(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/audit/${auditId}/sections/${sectionId}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load section");
      }

      setSectionData(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load section",
      );
    } finally {
      setLoadingSection(false);
    }
  }, [auditId]);

  useEffect(() => {
    loadSection(activeSectionId);
  }, [activeSectionId, loadSection]);

  function handleSectionSelect(sectionId: string) {
    setError(null);
    setActiveSectionId(sectionId);
    router.replace(
      `/premises/${premisesId}/audit/${auditId}?section=${sectionId}`,
      { scroll: false },
    );
  }

  async function saveQuestion(
    itemId: string,
    sectionId: string,
    payload: QuestionSavePayload,
  ) {
    setSavingItemId(itemId);
    setError(null);

    try {
      const apiResponse = await fetch(`/api/audit/${auditId}/responses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          sectionId,
          response: payload.response,
          notes: payload.notes || null,
          recordedDate: payload.recordedDate || null,
          needsAction: false,
        }),
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(result.error ?? "Failed to save response");
      }

      const savedResponse = {
        id: result.data.response.id,
        response: result.data.response.response,
        needsAction: result.data.response.needsAction,
        notes: result.data.response.notes,
        recordedDate: result.data.response.recordedDate ?? null,
      };

      setSectionData((current) => {
        if (!current) return current;
        return {
          ...current,
          section: {
            ...current.section,
            status: result.data.sectionStatus,
          },
          items: updateSectionItemResponse(current.items, itemId, savedResponse),
        };
      });

      void refreshOverview();
    } catch (saveError) {
      throw saveError;
    } finally {
      setSavingItemId(null);
    }
  }

  async function handleActionSubmit(input: {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
  }) {
    if (!actionDialog) return;

    setSavingAction(true);
    setError(null);

    try {
      const isEditing = Boolean(actionDialog.existingAction);
      const response = await fetch(
        isEditing
          ? `/api/actions/${actionDialog.existingAction!.id}`
          : `/api/audit/${auditId}/actions`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? {
                  title: input.title,
                  description: input.description || null,
                  priority: input.priority,
                  dueDate: input.dueDate || null,
                }
              : {
                  title: input.title,
                  description: input.description || null,
                  priority: input.priority,
                  dueDate: input.dueDate || null,
                  itemId: actionDialog.item.id,
                },
          ),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to save action");
      }

      const linkedAction = result.data as AuditLinkedAction;
      const itemId = actionDialog.item.id;
      const currentActions = actionDialog.item.actions;

      const nextActions = isEditing
        ? currentActions.map((action) =>
            action.id === linkedAction.id ? linkedAction : action,
          )
        : [...currentActions, linkedAction];

      setSectionData((current) => {
        if (!current) return current;
        return {
          ...current,
          items: updateSectionItemActions(current.items, itemId, nextActions),
        };
      });

      setActionDialog(null);
      await refreshOverview();
    } finally {
      setSavingAction(false);
    }
  }

  async function handleDeleteAction(
    item: AuditItemWithResponse,
    action: AuditLinkedAction,
  ) {
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

      const nextActions = item.actions.filter((entry) => entry.id !== action.id);

      setSectionData((current) => {
        if (!current) return current;
        return {
          ...current,
          items: updateSectionItemActions(current.items, item.id, nextActions),
        };
      });

      await refreshOverview();
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

  const activeSection = overview.sections.find(
    (section) => section.id === activeSectionId,
  );

  const actionHandlers = {
    onAddAction: (item: AuditItemWithResponse) =>
      setActionDialog({ item, existingAction: null }),
    onEditAction: (item: AuditItemWithResponse, action: AuditLinkedAction) =>
      setActionDialog({ item, existingAction: action }),
    onDeleteAction: handleDeleteAction,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">
              Template {overview.templateVersion} · Draft audit
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              {overview.premises.name}
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            {overview.progress.completedSections} of{" "}
            {overview.progress.totalSections} sections complete
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Sections</h2>
          <SectionNav
            sections={overview.sections}
            activeSectionId={activeSectionId}
            onSelect={handleSectionSelect}
          />
        </aside>

        <section className="min-w-0 space-y-4">
          {activeSection ? (
            <header>
              <p className="text-sm text-slate-500">
                Section {activeSection.number}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {activeSection.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Answer each question below. Your responses are saved automatically.
              </p>
            </header>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loadingSection ? (
            <p className="text-sm text-slate-500">Loading questions…</p>
          ) : sectionData ? (
            <div className="space-y-4">
              {sectionData.items.map((entry) =>
                entry.kind === "group" ? (
                  <QuestionGroupCard
                    key={entry.id}
                    group={entry}
                    sectionId={sectionData.section.id}
                    savingItemId={savingItemId}
                    deletingActionId={deletingActionId}
                    onSave={async (itemId, sectionId, payload) => {
                      try {
                        await saveQuestion(itemId, sectionId, payload);
                      } catch (saveError) {
                        setError(
                          saveError instanceof Error
                            ? saveError.message
                            : "Failed to save response",
                        );
                        throw saveError;
                      }
                    }}
                    {...actionHandlers}
                  />
                ) : (
                  <QuestionCard
                    key={entry.item.id}
                    item={entry.item}
                    sectionId={sectionData.section.id}
                    saving={savingItemId === entry.item.id}
                    deletingActionId={deletingActionId}
                    onSave={async (itemId, sectionId, payload) => {
                      try {
                        await saveQuestion(itemId, sectionId, payload);
                      } catch (saveError) {
                        setError(
                          saveError instanceof Error
                            ? saveError.message
                            : "Failed to save response",
                        );
                        throw saveError;
                      }
                    }}
                    {...actionHandlers}
                  />
                ),
              )}
            </div>
          ) : null}
        </section>
      </div>

      {actionDialog ? (
        <ActionForm
          item={actionDialog.item}
          existingAction={actionDialog.existingAction}
          saving={savingAction}
          onSubmit={handleActionSubmit}
          onCancel={() => setActionDialog(null)}
        />
      ) : null}
    </div>
  );
}
