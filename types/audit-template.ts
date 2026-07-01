export type AuditTemplateItem = {
  id: string;
  question: string;
  guidance: string;
  responseType: "yes_no_na" | "yes_no_na_action";
  tags: string[];
};

export type AuditSectionScope = "all" | "extended";

export type AuditTemplateSection = {
  id: string;
  number: number;
  title: string;
  scope: AuditSectionScope;
  items: AuditTemplateItem[];
};

export type AuditTemplateSections = AuditTemplateSection[];
