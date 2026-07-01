import type { Premises, PremisesProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPremisesForOrganisation(
  premisesId: string,
  organisationId: string,
): Promise<(Premises & { profile: PremisesProfile | null }) | null> {
  return prisma.premises.findFirst({
    where: { id: premisesId, organisationId },
    include: { profile: true },
  });
}
