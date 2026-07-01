import type {
  AuditTemplateItem,
  AuditTemplateSection,
  AuditTemplateSections,
  AnswerableResponseType,
} from "@/types/audit-template";

type RawSubQuestion = {
  id: string;
  question: string;
  responseType: AnswerableResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
};

type RawItem = {
  id: string;
  question?: string;
  label?: string;
  guidance?: string | null;
  responseType: AuditTemplateItem["responseType"];
  requiresDocument: boolean;
  profileFlag?: string;
  documentType?: string;
  subQuestions?: readonly RawSubQuestion[];
};

type RawSubsection = {
  id: string;
  title: string;
  items: readonly RawItem[];
};

type RawSection = {
  id: string;
  number: number;
  title: string;
  scope?: "ALL" | "EXTENDED" | "all" | "extended";
  profileFlag?: string;
  items?: readonly RawItem[];
  subsections?: readonly RawSubsection[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSubQuestion(item: RawSubQuestion) {
  return {
    id: item.id,
    question: item.question,
    responseType: item.responseType,
    requiresDocument: item.requiresDocument,
    documentType: item.documentType,
    profileFlag: item.profileFlag,
  };
}

function normalizeItem(item: RawItem): AuditTemplateItem {
  if (item.responseType === "GROUP") {
    return {
      id: item.id,
      label: item.label ?? item.question ?? "",
      guidance: item.guidance ?? "",
      responseType: "GROUP",
      requiresDocument: false,
      profileFlag: item.profileFlag,
      subQuestions: (item.subQuestions ?? []).map(normalizeSubQuestion),
    };
  }

  return {
    id: item.id,
    question: item.question ?? "",
    guidance: item.guidance ?? "",
    responseType: item.responseType,
    requiresDocument: item.requiresDocument,
    documentType: item.documentType,
    profileFlag: item.profileFlag,
  };
}

function normalizeSection(section: RawSection): AuditTemplateSection {
  const items = section.subsections
    ? section.subsections.flatMap((subsection) => subsection.items)
    : (section.items ?? []);

  const scope =
    section.scope === "EXTENDED" || section.scope === "extended"
      ? "extended"
      : "all";

  return {
    id: section.id,
    number: section.number,
    title: section.title,
    scope,
    profileFlag: section.profileFlag,
    items: items.map(normalizeItem),
  };
}

export function normalizeUploadedSections(input: unknown): AuditTemplateSections {
  if (!Array.isArray(input)) {
    throw new Error("Template sections must be a JSON array");
  }

  return (input as RawSection[]).map(normalizeSection);
}

export function validateTemplateSections(
  sections: AuditTemplateSections,
): string | null {
  if (sections.length === 0) {
    return "Template must include at least one section";
  }

  const sectionIds = new Set<string>();
  const itemIds = new Set<string>();

  for (const section of sections) {
    if (!section.id?.trim() || !section.title?.trim()) {
      return "Each section needs an id and title";
    }

    if (sectionIds.has(section.id)) {
      return `Duplicate section id: ${section.id}`;
    }
    sectionIds.add(section.id);

    if (!Number.isFinite(section.number)) {
      return `Section ${section.id} needs a numeric order`;
    }

    if (!section.items?.length) {
      return `Section ${section.id} must include at least one item`;
    }

    for (const item of section.items) {
      if (item.responseType === "GROUP") {
        if (!item.id || !item.label) {
          return "Group items need an id and label";
        }
        if (itemIds.has(item.id)) {
          return `Duplicate item id: ${item.id}`;
        }
        itemIds.add(item.id);

        if (!item.subQuestions.length) {
          return `Group ${item.id} must include sub-questions`;
        }

        for (const subQuestion of item.subQuestions) {
          if (!subQuestion.id || !subQuestion.question) {
            return `Sub-questions in ${item.id} need an id and question`;
          }
          if (itemIds.has(subQuestion.id)) {
            return `Duplicate item id: ${subQuestion.id}`;
          }
          itemIds.add(subQuestion.id);
        }
      } else {
        if (!item.id || !item.question) {
          return "Questions need an id and question text";
        }
        if (itemIds.has(item.id)) {
          return `Duplicate item id: ${item.id}`;
        }
        itemIds.add(item.id);
      }
    }
  }

  return null;
}

export function parseUploadedTemplatePayload(body: unknown): {
  version: string;
  publishedAt: Date;
  description: string | null;
  sections: AuditTemplateSections;
  setActive: boolean;
} {
  if (!isRecord(body)) {
    throw new Error("Invalid request body");
  }

  const version = typeof body.version === "string" ? body.version.trim() : "";
  if (!version) {
    throw new Error("Template version is required (e.g. 2026-09)");
  }

  const publishedAtInput =
    typeof body.publishedAt === "string" ? body.publishedAt : "";
  const publishedAt = publishedAtInput
    ? new Date(publishedAtInput)
    : new Date();

  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error("Invalid published date");
  }

  const sections = normalizeUploadedSections(body.sections);

  const validationError = validateTemplateSections(sections);
  if (validationError) {
    throw new Error(validationError);
  }

  return {
    version,
    publishedAt,
    description:
      typeof body.description === "string" ? body.description.trim() : null,
    sections,
    setActive: body.setActive !== false,
  };
}

export function countTemplateSections(sections: AuditTemplateSections): number {
  return sections.length;
}
