# Project Context — Vigil (working name)

Paste this file into Cursor Composer at the start of every session:
> "Read CONTEXT.md before we start. Follow all conventions defined there."

---

## What this is

A multi-tenant SaaS web app for compliance management of volunteer-run community buildings — initially Scout huts in the UK. Trustees and premises managers use it to:

1. Set up a premises profile (drives which checks apply)
2. Complete a guided annual safety audit (25 sections, ~100 check items)
3. Build and maintain risk assessments (Fire, Legionella, COSHH, General)
4. Store compliance certificates with expiry tracking and email reminders
5. Track actions raised from audits/RAs through to completion
6. Generate a PDF compliance report for trustee board meetings

Think of it as lightweight FM software for volunteers — not Planon, not iAuditor. Simple, guided, opinionated.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | All routes under `app/` |
| Database | PostgreSQL via Supabase | Use Prisma as ORM |
| Auth | Supabase Auth | Email/password + magic link |
| File storage | Supabase Storage | Bucket: `documents` |
| Email | Resend | Transactional only |
| Styling | Tailwind CSS | No component library initially |
| PDF generation | react-pdf or puppeteer | For trustee reports and RA outputs |
| Deployment | Vercel | |

---

## Multi-tenancy model

- The top-level entity is `Organisation` (a Scout Group, District, or County).
- An organisation has one or more `Premises`.
- Users belong to an organisation and have a role scoped to that organisation.
- **Row-level security is enforced in Supabase** — every query must filter by the user's `organisationId`. Never return data across org boundaries.
- A user can belong to multiple organisations (e.g. a District Commissioner overseeing several Groups).

---

## Data model

```prisma
model Organisation {
  id          String      @id @default(cuid())
  name        String
  type        OrgType     // GROUP | DISTRICT | COUNTY
  parentId    String?
  parent      Organisation?  @relation("OrgHierarchy", fields: [parentId], references: [id])
  children    Organisation[] @relation("OrgHierarchy")
  premises    Premises[]
  memberships Membership[]
  createdAt   DateTime    @default(now())
}

model Membership {
  id             String       @id @default(cuid())
  userId         String
  organisationId String
  role           Role         // ADMIN | MANAGER | VIEWER
  organisation   Organisation @relation(fields: [organisationId], references: [id])
  createdAt      DateTime     @default(now())
  @@unique([userId, organisationId])
}

model Premises {
  id             String          @id @default(cuid())
  name           String
  address        String
  organisationId String
  organisation   Organisation    @relation(fields: [organisationId], references: [id])
  profile        PremisesProfile?
  audits         Audit[]
  documents      Document[]
  actions        Action[]
  riskAssessments RiskAssessment[]
  createdAt      DateTime        @default(now())
}

model PremisesProfile {
  id                  String    @id @default(cuid())
  premisesId          String    @unique
  premises            Premises  @relation(fields: [premisesId], references: [id])
  ownershipType       String    // OWNED | LEASED | HIRED
  buildingAgeBand     String    // PRE_1985 | 1985_2000 | POST_2000 — drives asbestos applicability
  hasGas              Boolean   @default(false)
  hasSleeping         Boolean   @default(false)  // triggers enhanced fire/safeguarding sections
  hasCateringKitchen  Boolean   @default(false)
  hasGrounds          Boolean   @default(false)
  hasVehicles         Boolean   @default(false)
  hasPlantMachinery   Boolean   @default(false)
  hasThirdPartyUsers  Boolean   @default(false)
  floodRiskZone       String?   // LOW | MEDIUM | HIGH
  applicableSections  String[]  // array of section IDs derived from above flags
  updatedAt           DateTime  @updatedAt
}

model AuditTemplate {
  id           String                  @id @default(cuid())
  version      String                  // e.g. "2025-09" — annual/questionnaire release
  revision     Int                     @default(1) // patch within a release
  changeType   AuditTemplateChangeType @default(RELEASE) // RELEASE | PATCH
  description  String?
  publishedAt  DateTime
  sections     Json                    // Array of sections/items
  isActive     Boolean                 @default(false) // template used for new audits
  supersededAt DateTime?
  audits       Audit[]

  @@unique([version, revision])
}

// Each premises may have multiple audits over time. There is no one-audit-per-year rule.
// Draft audits follow the latest revision of the active template.
// Completed audits store a sectionsSnapshot so template patches do not rewrite history.

model Audit {
  id               String        @id @default(cuid())
  premisesId       String
  premises         Premises      @relation(fields: [premisesId], references: [id])
  templateId       String
  template         AuditTemplate @relation(fields: [templateId], references: [id])
  templateRevision Int           // pinned at start; updated for drafts on template sync
  auditDate        DateTime      @db.Date    // date of the inspection/review (not enforced annually)
  sectionsSnapshot Json?         // frozen template JSON when status becomes COMPLETE
  status           AuditStatus   // DRAFT | COMPLETE
  startedBy        String        // userId
  startedAt        DateTime      @default(now())
  completedAt      DateTime?
  responses        AuditResponse[]
  sections         AuditSection[]
}

model AuditSection {
  id         String   @id @default(cuid())
  auditId    String
  audit      Audit    @relation(fields: [auditId], references: [id])
  sectionId  String   // matches id in template JSON
  status     String   // NOT_STARTED | IN_PROGRESS | COMPLETE | SKIPPED
}

model AuditResponse {
  id          String         @id @default(cuid())
  auditId     String
  audit       Audit          @relation(fields: [auditId], references: [id])
  itemId      String         // matches item id in template JSON
  response    ResponseValue  // YES | NO | NA | ACTION_NEEDED
  notes       String?
  respondedBy String         // userId
  respondedAt DateTime       @default(now())
}

model RiskAssessment {
  id             String    @id @default(cuid())
  premisesId     String
  premises       Premises  @relation(fields: [premisesId], references: [id])
  raType         RAType    // FIRE | LEGIONELLA | COSHH | GENERAL
  version        Int       @default(1)
  status         RAStatus  // DRAFT | COMPLETE | ARCHIVED
  createdBy      String    // userId
  createdAt      DateTime  @default(now())
  completedAt    DateTime?
  nextReviewDate DateTime?
  hazards        RAHazard[]
  document       Document? // set when RA is finalised as PDF
}

model RAHazard {
  id                  String         @id @default(cuid())
  raId                String
  ra                  RiskAssessment @relation(fields: [raId], references: [id])
  description         String
  affectedPersons     String[]       // e.g. ["volunteers", "young_people", "visitors"]
  likelihood          Int            // 1-5
  severity            Int            // 1-5
  riskRating          Int            // computed: likelihood * severity
  existingControls    String
  residualLikelihood  Int
  residualSeverity    Int
  residualRisk        Int
  furtherActionNeeded Boolean        @default(false)
  actionId            String?        // FK to Action if furtherActionNeeded
  action              Action?        @relation(fields: [actionId], references: [id])
}

model Document {
  id           String       @id @default(cuid())
  premisesId   String
  premises     Premises     @relation(fields: [premisesId], references: [id])
  docType      DocType      // FIRE_RA | EICR | GAS_SAFE | PAT | ASBESTOS | LEGIONELLA | etc.
  displayName  String
  storagePath  String       // Supabase Storage path
  issueDate    DateTime?
  expiryDate   DateTime?
  issuerName   String?
  status       DocStatus    // CURRENT | EXPIRING_SOON | EXPIRED
  source       DocSource    // UPLOAD | RA_BUILDER
  raId         String?      @unique  // set if generated by RA builder
  ra           RiskAssessment? @relation(fields: [raId], references: [id])
  uploadedBy   String       // userId
  uploadedAt   DateTime     @default(now())
  reminders    ReminderLog[]
}

model Action {
  id              String      @id @default(cuid())
  premisesId      String
  premises        Premises    @relation(fields: [premisesId], references: [id])
  title           String
  description     String?
  sourceType      String?     // AUDIT | RA | MANUAL
  sourceRef       String?     // auditId or raId
  sourceItemId    String?     // itemId within audit/RA
  priority        Priority    // HIGH | MEDIUM | LOW
  assignedTo      String?     // userId
  dueDate         DateTime?
  status          ActionStatus // OPEN | IN_PROGRESS | RESOLVED
  resolvedAt      DateTime?
  resolutionNotes String?
  createdBy       String      // userId
  createdAt       DateTime    @default(now())
  raHazards       RAHazard[]
}

model ReminderLog {
  id           String   @id @default(cuid())
  documentId   String
  document     Document @relation(fields: [documentId], references: [id])
  reminderType String   // 90D | 30D | 7D | EXPIRED
  sentAt       DateTime @default(now())
  recipient    String   // email address
}

enum OrgType      { GROUP DISTRICT COUNTY }
enum Role         { ADMIN MANAGER VIEWER }
enum AuditStatus  { DRAFT COMPLETE }
enum ResponseValue { YES NO NA ACTION_NEEDED }
enum RAType       { FIRE LEGIONELLA COSHH GENERAL }
enum RAStatus     { DRAFT COMPLETE ARCHIVED }
enum Priority     { HIGH MEDIUM LOW }
enum ActionStatus { OPEN IN_PROGRESS RESOLVED }
enum DocStatus    { CURRENT EXPIRING_SOON EXPIRED }
enum DocSource    { UPLOAD RA_BUILDER }
enum DocType      {
  FIRE_RA EICR GAS_SAFE PAT ASBESTOS LEGIONELLA
  EMERGENCY_LIGHTING FIRE_EXTINGUISHER FLOOD_RISK
  CONTRACTOR_INSURANCE OTHER
}
```

---

## Key business rules

- `PremisesProfile.applicableSections` is recomputed whenever the profile is saved. It's an array of section IDs from the active `AuditTemplate`. Sections are excluded based on profile flags (e.g. no gas → exclude section 6, no sleeping → skip sleeping-specific sub-questions).
- `Document.status` is recomputed on a nightly cron job: `EXPIRING_SOON` if expiryDate is within 60 days, `EXPIRED` if past.
- `RAHazard.riskRating = likelihood * severity`. Residual risk is computed the same way. Neither is stored as a formula — store the computed integer.
- An `Action` with `priority = HIGH` and `status != RESOLVED` causes the relevant audit section's RAG status to be RED. MEDIUM = AMBER. All resolved or no actions = GREEN. This is computed on read, not stored.
- When a `RiskAssessment` reaches status `COMPLETE`, a PDF is generated and a `Document` record is created automatically with `source = RA_BUILDER` and `docType` matching the `raType`.
- Email reminders are sent via a Resend scheduled job at 90, 30, and 7 days before `Document.expiryDate`, and once on the day of expiry.

---

## Folder structure (App Router)

```
app/
  (auth)/
    login/
    register/
  (app)/
    layout.tsx           # authenticated shell with sidebar
    dashboard/           # compliance overview for current premises
    premises/
      [id]/
        profile/         # premises profile wizard
        audit/
          [auditId]/     # audit wizard
        risk-assessments/
          [raId]/        # RA wizard
        documents/       # document vault
        actions/         # action tracker
    settings/
      organisation/
      users/
    report/[premisesId]/ # trustee report (PDF export)
  api/
    audit/
    documents/
    actions/
    reminders/           # called by cron
    report/

components/
  ui/           # headless/primitive UI components
  audit/        # AuditWizard, SectionNav, QuestionCard, ResponseInput
  ra/           # RAWizard, HazardRow, RiskMatrix
  documents/    # DocumentVault, UploadModal, ExpiryBadge
  actions/      # ActionList, ActionCard, ActionForm
  dashboard/    # ComplianceSummary, RAGCard, TimelineView
  report/       # TrusteeReport (react-pdf components)

lib/
  prisma.ts       # Prisma client singleton
  supabase.ts     # Supabase client (server + browser)
  auth.ts         # auth helpers
  compliance.ts   # RAG status computation
  sections.ts     # audit section filtering logic from profile
  reminders.ts    # reminder scheduling logic
  pdf.ts          # PDF generation helpers

types/
  index.ts        # shared TypeScript types (re-export Prisma types + extras)
```

---

## Conventions

- **Always filter by `organisationId` or `premisesId`** in every DB query. Never trust client-supplied IDs without verifying they belong to the authenticated user's organisation.
- **Server components by default.** Only add `"use client"` when you need interactivity (form state, wizards, drag-drop).
- **API routes return `{ data, error }` consistently.** Never throw raw errors to the client.
- **Wizard state** (audit, RA) is saved to the database on every step — not held in local state until the end. Users must be able to close the browser and resume.
- **No magic strings.** Use the Prisma enums for status, type, priority etc. everywhere.
- **Dates are always stored as UTC** in the DB. Display in the user's local timezone using `Intl.DateTimeFormat`.
- **File uploads** go to Supabase Storage at path `{organisationId}/{premisesId}/{docType}/{filename}`. Never expose storage paths to the client directly — generate signed URLs server-side.

---

## What we're building next

Start with:
1. Prisma schema migration and seed script (audit template v2025-09 as JSON)
2. Premises profile wizard (5-step form, saves `PremisesProfile`, recomputes `applicableSections`)
3. Audit wizard (one section working end-to-end: load items, render questions, save responses, raise actions)

Do not start on risk assessment builder, document vault, or dashboard until the audit wizard is working.
