import { OrgType, Role, PrismaClient, OwnershipType, BuildingAgeBand, FloodRiskZone } from "@prisma/client";
import { DEV_USER_ID } from "../lib/auth";
import { computeApplicableSections } from "../lib/sections";
import {
  auditTemplate202509,
  AUDIT_TEMPLATE_PUBLISHED_AT,
  AUDIT_TEMPLATE_VERSION,
} from "./data/audit-template-normalized";

const prisma = new PrismaClient();

const DEV_ORG_ID = "dev-org-3rd-southfield";
const DEV_PREMISES_ID = "dev-premises-hut";

async function main() {
  console.log("Seeding database...");

  const template = await prisma.auditTemplate.upsert({
    where: {
      version_revision: {
        version: AUDIT_TEMPLATE_VERSION,
        revision: 1,
      },
    },
    update: {
      sections: auditTemplate202509,
      publishedAt: AUDIT_TEMPLATE_PUBLISHED_AT,
      isActive: true,
      changeType: "RELEASE",
      description: "Scout Association premises audit — September 2025 release",
    },
    create: {
      version: AUDIT_TEMPLATE_VERSION,
      revision: 1,
      changeType: "RELEASE",
      description: "Scout Association premises audit — September 2025 release",
      publishedAt: AUDIT_TEMPLATE_PUBLISHED_AT,
      sections: auditTemplate202509,
      isActive: true,
    },
  });

  console.log(
    `Audit template seeded: ${template.version} rev ${template.revision} (${template.id})`,
  );
  console.log(
    `  Sections: ${auditTemplate202509.length}, Top-level items: ${auditTemplate202509.reduce((n, s) => n + s.items.length, 0)}, Answerable questions: ${auditTemplate202509.reduce((n, s) => n + s.items.reduce((count, item) => count + (item.responseType === "GROUP" ? item.subQuestions.length : 1), 0), 0)}`,
  );

  const organisation = await prisma.organisation.upsert({
    where: { id: DEV_ORG_ID },
    update: {
      name: "3rd Southfield Scout Group",
      type: OrgType.GROUP,
    },
    create: {
      id: DEV_ORG_ID,
      name: "3rd Southfield Scout Group",
      type: OrgType.GROUP,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organisationId: {
        userId: DEV_USER_ID,
        organisationId: organisation.id,
      },
    },
    update: { role: Role.ADMIN },
    create: {
      userId: DEV_USER_ID,
      organisationId: organisation.id,
      role: Role.ADMIN,
    },
  });

  const premises = await prisma.premises.upsert({
    where: { id: DEV_PREMISES_ID },
    update: {
      name: "3rd Southfield Scout Hut",
      address: "12 Oak Lane, Southfield, SF1 2AB",
      organisationId: organisation.id,
    },
    create: {
      id: DEV_PREMISES_ID,
      name: "3rd Southfield Scout Hut",
      address: "12 Oak Lane, Southfield, SF1 2AB",
      organisationId: organisation.id,
    },
  });

  const profileInput = {
    buildingAgeBand: BuildingAgeBand.PRE_1985,
    hasGas: true,
    hasSleeping: false,
    hasCateringKitchen: false,
    hasGrounds: true,
    hasVehicles: false,
    hasPlantMachinery: false,
    hasThirdPartyUsers: false,
    floodRiskZone: FloodRiskZone.LOW,
  };

  await prisma.premisesProfile.upsert({
    where: { premisesId: premises.id },
    update: {
      ownershipType: OwnershipType.OWNED,
      ...profileInput,
      applicableSections: computeApplicableSections(profileInput),
    },
    create: {
      premisesId: premises.id,
      ownershipType: OwnershipType.OWNED,
      ...profileInput,
      applicableSections: computeApplicableSections(profileInput),
    },
  });

  console.log(`Dev organisation: ${organisation.name} (${organisation.id})`);
  console.log(`Dev premises: ${premises.name} (${premises.id})`);
  console.log(`  Profile wizard: /premises/${premises.id}/profile`);
  console.log(`  Audit wizard:   /premises/${premises.id}/audit`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
