export type AuditTemplateItem = {
  id: string;
  question: string;
  guidance: string;
  responseType: "yes_no_na" | "yes_no_na_action";
  tags: string[];
};

export type AuditTemplateSection = {
  id: string;
  number: number;
  title: string;
  items: AuditTemplateItem[];
};

export type AuditTemplateSections = AuditTemplateSection[];
