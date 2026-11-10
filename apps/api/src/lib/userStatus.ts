import type { PrismaClient } from "../generated/prisma/client.js";

/**
 * Account status lookup for the auth middleware.
 *
 * Access tokens are stateless, so deactivating or deleting a user would otherwise only take
 * effect when the token expires. The status is therefore checked on authenticated requests,
 * cached briefly to avoid a database round trip on every call.
 */

type Status = "ACTIVE" | "INACTIVE" | "DELETED";

const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { status: Status | null; at: number }>();

/** Returns the user's status, or null if the user no longer exists. */
export async function getUserStatus(
  db: PrismaClient,
  userId: string,
): Promise<Status | null> {
  const hit = cache.get(userId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.status;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });
  const status = (user?.status as Status | undefined) ?? null;
  cache.set(userId, { status, at: Date.now() });
  // keep the map from growing without bound
  if (cache.size > 5000) cache.clear();
  return status;
}

/** Call right after an admin changes a user's status so this instance reacts immediately. */
export function invalidateUserStatus(userId: string) {
  cache.delete(userId);
}
