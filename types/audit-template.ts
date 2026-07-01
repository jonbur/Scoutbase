export type AuditResponseType =
  | "YES_NO_NA_ACTION"
  | "OPEN_TEXT"
  | "DATE_UPLOAD"
  | "GROUP";

export type AnswerableResponseType = Exclude<AuditResponseType, "GROUP">;

export type AuditSubQuestion = {
  id: string;
  question: string;
  responseType: AnswerableResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
};

export type AtomicAuditTemplateItem = {
  id: string;
  question: string;
  guidance: string;
  responseType: AnswerableResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
};

export type GroupAuditTemplateItem = {
  id: string;
  label: string;
  guidance: string;
  responseType: "GROUP";
  requiresDocument: false;
  profileFlag?: string;
  subQuestions: AuditSubQuestion[];
};

export type AuditTemplateItem = AtomicAuditTemplateItem | GroupAuditTemplateItem;

export type AnswerableAuditItem = AtomicAuditTemplateItem | AuditSubQuestion;

export type AuditSectionScope = "all" | "extended";

export type AuditTemplateSection = {
  id: string;
  number: number;
  title: string;
  scope: AuditSectionScope;
  profileFlag?: string;
  items: AuditTemplateItem[];
};

export type AuditTemplateSections = AuditTemplateSection[];

export function isGroupItem(
  item: AuditTemplateItem,
): item is GroupAuditTemplateItem {
  return item.responseType === "GROUP";
}

export function isYesNoItem(item: AnswerableAuditItem): boolean {
  return item.responseType === "YES_NO_NA_ACTION";
}

export function isOpenTextItem(item: AnswerableAuditItem): boolean {
  return item.responseType === "OPEN_TEXT";
}

export function isDateUploadItem(item: AnswerableAuditItem): boolean {
  return item.responseType === "DATE_UPLOAD";
}

export function isTextAnswerItem(item: {
  responseType: AuditResponseType;
}): boolean {
  return item.responseType === "OPEN_TEXT" || item.responseType === "DATE_UPLOAD";
}
