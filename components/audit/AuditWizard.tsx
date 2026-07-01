"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Priority } from "@prisma/client";
import type { QuestionSavePayload } from "@/components/audit/QuestionCard";
import { ActionRaiseForm } from "@/components/audit/ActionRaiseForm";
import { QuestionCard } from "@/components/audit/QuestionCard";
import { SectionNav } from "@/components/audit/SectionNav";
import type {
  AuditItemWithResponse,
  AuditOverview,
  AuditSectionPayload,
} from "@/types/audit";

type AuditWizardProps = {
  premisesId: string;
  auditId: string;
  initialOverview: AuditOverview;
  initialSectionId: string;
};

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
  const [actionItem, setActionItem] = useState<AuditItemWithResponse | null>(null);
  const [raisingAction, setRaisingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionItemIds, setActionItemIds] = useState<string[]>([]);

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
      setActionItemIds(result.data.actionItemIds ?? []);
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
    setActiveSectionId(sectionId);
    router.replace(
      `/premises/${premisesId}/audit/${auditId}?section=${sectionId}`,
      { scroll: false },
    );
  }

  async function saveQuestion(
    itemId: string,
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
          sectionId: activeSectionId,
          response: payload.response,
          notes: payload.notes || null,
          needsAction: payload.needsAction,
        }),
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(result.error ?? "Failed to save response");
      }

      setSectionData((current) => {
        if (!current) return current;
        return {
          ...current,
          section: {
            ...current.section,
            status: result.data.sectionStatus,
          },
          items: current.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  response: {
                    id: result.data.response.id,
                    response: result.data.response.response,
                    needsAction: result.data.response.needsAction,
                    notes: result.data.response.notes,
                  },
                }
              : item,
          ),
        };
      });

      if (payload.needsAction) {
        setActionItemIds((current) =>
          current.includes(itemId) ? current : [...current, itemId],
        );
      } else {
        setActionItemIds((current) => current.filter((id) => id !== itemId));
      }

      await refreshOverview();
    } catch (saveError) {
      throw saveError;
    } finally {
      setSavingItemId(null);
    }
  }

  async function handleRaiseAction(input: {
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
  }) {
    if (!actionItem) return;

    setRaisingAction(true);
    setError(null);

    try {
      const response = await fetch(`/api/audit/${auditId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          description: input.description || null,
          priority: input.priority,
          dueDate: input.dueDate || null,
          itemId: actionItem.id,
          sectionId: activeSectionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to raise action");
      }

      setActionItemIds((current) =>
        current.includes(actionItem.id) ? current : [...current, actionItem.id],
      );
      setActionItem(null);
      await loadSection(activeSectionId);
      await refreshOverview();
    } finally {
      setRaisingAction(false);
    }
  }

  const activeSection = overview.sections.find(
    (section) => section.id === activeSectionId,
  );

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
              {sectionData.items.map((item) => (
                <QuestionCard
                  key={item.id}
                  item={item}
                  saving={savingItemId === item.id}
                  hasAction={actionItemIds.includes(item.id)}
                  onSave={async (itemId, payload) => {
                    try {
                      await saveQuestion(itemId, payload);
                    } catch (saveError) {
                      setError(
                        saveError instanceof Error
                          ? saveError.message
                          : "Failed to save response",
                      );
                      throw saveError;
                    }
                  }}
                  onRaiseAction={setActionItem}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {actionItem ? (
        <ActionRaiseForm
          item={actionItem}
          saving={raisingAction}
          onSubmit={handleRaiseAction}
          onCancel={() => setActionItem(null)}
        />
      ) : null}
    </div>
  );
}
