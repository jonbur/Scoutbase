export type AuditResponseType =
  | "YES_NO_NA_ACTION"
  | "OPEN_TEXT"
  | "DATE_UPLOAD";

export type AuditTemplateItem = {
  id: string;
  question: string;
  guidance: string;
  responseType: AuditResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
};

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

export function isYesNoItem(item: AuditTemplateItem): boolean {
  return item.responseType === "YES_NO_NA_ACTION";
}

export function isOpenTextItem(item: AuditTemplateItem): boolean {
  return item.responseType === "OPEN_TEXT";
}

export function isDateUploadItem(item: AuditTemplateItem): boolean {
  return item.responseType === "DATE_UPLOAD";
}

export function isTextAnswerItem(item: AuditTemplateItem): boolean {
  return item.responseType === "OPEN_TEXT" || item.responseType === "DATE_UPLOAD";
}
