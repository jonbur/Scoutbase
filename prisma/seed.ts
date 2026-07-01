import { PrismaClient } from "@prisma/client";
import { auditTemplate202509 } from "./data/audit-template-2025-09";

const prisma = new PrismaClient();

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
