import { prisma } from "@/lib/prisma";

export type AuthContext = {
  userId: string;
  organisationId: string;
};

/** Development user ID until Supabase Auth is integrated. */
export const DEV_USER_ID = "dev-user-scoutbase";

/**
 * Returns the authenticated user's context.
 * TODO: Replace with Supabase Auth session.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const membership = await prisma.membership.findFirst({
    orderBy: { createdAt: "asc" },
    select: { userId: true, organisationId: true },
  });

  if (!membership) {
    return null;
  }

  return {
    userId: membership.userId,
    organisationId: membership.organisationId,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) {
    throw new Error("Unauthorized");
  }
  return context;
}
