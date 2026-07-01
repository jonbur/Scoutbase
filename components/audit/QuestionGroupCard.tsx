"use client";

import { useMemo } from "react";
import type { QuestionSavePayload } from "@/components/audit/QuestionCard";
import { QuestionCard } from "@/components/audit/QuestionCard";
import type {
  AuditGroupSectionItem,
  AuditItemWithResponse,
} from "@/types/audit";

type QuestionGroupCardProps = {
  group: AuditGroupSectionItem;
  sectionId: string;
  savingItemId: string | null;
  onSave: (
    itemId: string,
    sectionId: string,
    payload: QuestionSavePayload,
  ) => Promise<void>;
  onRaiseAction: (item: AuditItemWithResponse) => void;
  onEditAction: (item: AuditItemWithResponse) => void;
};

function toQuestionItem(
  subQuestion: AuditGroupSectionItem["subQuestions"][number],
): AuditItemWithResponse {
  return {
    id: subQuestion.id,
    question: subQuestion.question,
    guidance: "",
    responseType: subQuestion.responseType,
    requiresDocument: subQuestion.requiresDocument,
    documentType: subQuestion.documentType,
    profileFlag: subQuestion.profileFlag,
    response: subQuestion.response,
    action: subQuestion.action,
  };
}

export function QuestionGroupCard({
  group,
  sectionId,
  savingItemId,
  onSave,
  onRaiseAction,
  onEditAction,
}: QuestionGroupCardProps) {
  const questionItems = useMemo(
    () => group.subQuestions.map((subQuestion) => toQuestionItem(subQuestion)),
    [group.subQuestions],
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-medium text-slate-900">{group.label}</h3>
      {group.guidance ? (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {group.guidance}
        </p>
      ) : null}

      <div className="mt-4 space-y-4 border-l-2 border-emerald-100 pl-4">
        {questionItems.map((item) => (
          <QuestionCard
            key={item.id}
            item={item}
            sectionId={sectionId}
            variant="sub"
            saving={savingItemId === item.id}
            onSave={onSave}
            onRaiseAction={onRaiseAction}
            onEditAction={onEditAction}
          />
        ))}
      </div>
    </article>
  );
}
