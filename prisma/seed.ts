import { OrgType, Role, PrismaClient } from "@prisma/client";
import { DEV_USER_ID } from "../lib/auth";
import { auditTemplate202509 } from "./data/audit-template-2025-09";

const prisma = new PrismaClient();

const DEV_ORG_ID = "dev-org-3rd-southfield";
const DEV_PREMISES_ID = "dev-premises-hut";

async function main() {
  console.log("Seeding database...");

  const template = await prisma.auditTemplate.upsert({
    where: { version: "2025-09" },
    update: {
      sections: auditTemplate202509,
      publishedAt: new Date("2025-09-01T00:00:00.000Z"),
      isActive: true,
    },
    create: {
      version: "2025-09",
      publishedAt: new Date("2025-09-01T00:00:00.000Z"),
      sections: auditTemplate202509,
      isActive: true,
    },
  });

  console.log(`Audit template seeded: ${template.version} (${template.id})`);
  console.log(
    `  Sections: ${auditTemplate202509.length}, Items: ${auditTemplate202509.reduce((n, s) => n + s.items.length, 0)}`,
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

  console.log(`Dev organisation: ${organisation.name} (${organisation.id})`);
  console.log(`Dev premises: ${premises.name} (${premises.id})`);
  console.log(`  Profile wizard: /premises/${premises.id}/profile`);
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
