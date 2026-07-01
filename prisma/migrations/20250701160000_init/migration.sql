-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('GROUP', 'DISTRICT', 'COUNTY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('OWNED', 'LEASED', 'HIRED');

-- CreateEnum
CREATE TYPE "BuildingAgeBand" AS ENUM ('PRE_1985', 'Y1985_2000', 'POST_2000');

-- CreateEnum
CREATE TYPE "FloodRiskZone" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('DRAFT', 'COMPLETE');

-- CreateEnum
CREATE TYPE "AuditSectionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ResponseValue" AS ENUM ('YES', 'NO', 'NA', 'ACTION_NEEDED');

-- CreateEnum
CREATE TYPE "RAType" AS ENUM ('FIRE', 'LEGIONELLA', 'COSHH', 'GENERAL');

-- CreateEnum
CREATE TYPE "RAStatus" AS ENUM ('DRAFT', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ActionSourceType" AS ENUM ('AUDIT', 'RA', 'MANUAL');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('CURRENT', 'EXPIRING_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocSource" AS ENUM ('UPLOAD', 'RA_BUILDER');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('FIRE_RA', 'EICR', 'GAS_SAFE', 'PAT', 'ASBESTOS', 'LEGIONELLA', 'EMERGENCY_LIGHTING', 'FIRE_EXTINGUISHER', 'FLOOD_RISK', 'CONTRACTOR_INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('D90', 'D30', 'D7', 'EXPIRED');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Premises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Premises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremisesProfile" (
    "id" TEXT NOT NULL,
    "premisesId" TEXT NOT NULL,
    "ownershipType" "OwnershipType" NOT NULL,
    "buildingAgeBand" "BuildingAgeBand" NOT NULL,
    "hasGas" BOOLEAN NOT NULL DEFAULT false,
    "hasSleeping" BOOLEAN NOT NULL DEFAULT false,
    "hasCateringKitchen" BOOLEAN NOT NULL DEFAULT false,
    "hasGrounds" BOOLEAN NOT NULL DEFAULT false,
    "hasVehicles" BOOLEAN NOT NULL DEFAULT false,
    "hasPlantMachinery" BOOLEAN NOT NULL DEFAULT false,
    "hasThirdPartyUsers" BOOLEAN NOT NULL DEFAULT false,
    "floodRiskZone" "FloodRiskZone",
    "applicableSections" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremisesProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTemplate" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sections" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuditTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "premisesId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL,
    "startedBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSection" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "status" "AuditSectionStatus" NOT NULL,

    CONSTRAINT "AuditSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditResponse" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "response" "ResponseValue" NOT NULL,
    "notes" TEXT,
    "respondedBy" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "premisesId" TEXT NOT NULL,
    "raType" "RAType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "RAStatus" NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAHazard" (
    "id" TEXT NOT NULL,
    "raId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedPersons" TEXT[],
    "likelihood" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "riskRating" INTEGER NOT NULL,
    "existingControls" TEXT NOT NULL,
    "residualLikelihood" INTEGER NOT NULL,
    "residualSeverity" INTEGER NOT NULL,
    "residualRisk" INTEGER NOT NULL,
    "furtherActionNeeded" BOOLEAN NOT NULL DEFAULT false,
    "actionId" TEXT,

    CONSTRAINT "RAHazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "premisesId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "issuerName" TEXT,
    "status" "DocStatus" NOT NULL,
    "source" "DocSource" NOT NULL,
    "raId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "premisesId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" "ActionSourceType",
    "sourceRef" TEXT,
    "sourceItemId" TEXT,
    "priority" "Priority" NOT NULL,
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient" TEXT NOT NULL,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organisation_parentId_idx" ON "Organisation"("parentId");

-- CreateIndex
CREATE INDEX "Membership_organisationId_idx" ON "Membership"("organisationId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organisationId_key" ON "Membership"("userId", "organisationId");

-- CreateIndex
CREATE INDEX "Premises_organisationId_idx" ON "Premises"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "PremisesProfile_premisesId_key" ON "PremisesProfile"("premisesId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditTemplate_version_key" ON "AuditTemplate"("version");

-- CreateIndex
CREATE INDEX "Audit_premisesId_idx" ON "Audit"("premisesId");

-- CreateIndex
CREATE INDEX "Audit_templateId_idx" ON "Audit"("templateId");

-- CreateIndex
CREATE INDEX "AuditSection_auditId_idx" ON "AuditSection"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSection_auditId_sectionId_key" ON "AuditSection"("auditId", "sectionId");

-- CreateIndex
CREATE INDEX "AuditResponse_auditId_idx" ON "AuditResponse"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditResponse_auditId_itemId_key" ON "AuditResponse"("auditId", "itemId");

-- CreateIndex
CREATE INDEX "RiskAssessment_premisesId_idx" ON "RiskAssessment"("premisesId");

-- CreateIndex
CREATE INDEX "RAHazard_raId_idx" ON "RAHazard"("raId");

-- CreateIndex
CREATE INDEX "RAHazard_actionId_idx" ON "RAHazard"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_raId_key" ON "Document"("raId");

-- CreateIndex
CREATE INDEX "Document_premisesId_idx" ON "Document"("premisesId");

-- CreateIndex
CREATE INDEX "Document_expiryDate_idx" ON "Document"("expiryDate");

-- CreateIndex
CREATE INDEX "Action_premisesId_idx" ON "Action"("premisesId");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE INDEX "ReminderLog_documentId_idx" ON "ReminderLog"("documentId");

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premises" ADD CONSTRAINT "Premises_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremisesProfile" ADD CONSTRAINT "PremisesProfile_premisesId_fkey" FOREIGN KEY ("premisesId") REFERENCES "Premises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_premisesId_fkey" FOREIGN KEY ("premisesId") REFERENCES "Premises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AuditTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSection" ADD CONSTRAINT "AuditSection_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditResponse" ADD CONSTRAINT "AuditResponse_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_premisesId_fkey" FOREIGN KEY ("premisesId") REFERENCES "Premises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAHazard" ADD CONSTRAINT "RAHazard_raId_fkey" FOREIGN KEY ("raId") REFERENCES "RiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAHazard" ADD CONSTRAINT "RAHazard_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_premisesId_fkey" FOREIGN KEY ("premisesId") REFERENCES "Premises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_raId_fkey" FOREIGN KEY ("raId") REFERENCES "RiskAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_premisesId_fkey" FOREIGN KEY ("premisesId") REFERENCES "Premises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

