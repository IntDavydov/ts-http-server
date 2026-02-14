import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { RefreshToken, refreshTokens, User, users } from "../schema.js";
import { DBError } from "../../api/errors.js";
import { config } from "../../config.js";

export async function addRefreshToken(
  userId: string,
  token: string,
): Promise<RefreshToken> {
  const [result] = await db
    .insert(refreshTokens)
    .values({
      userId,
      token,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
      revokedAt: null,
    })
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function getRefreshToken(
  refreshToken: string,
): Promise<RefreshToken> {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, refreshToken));

  return result;
}

export async function userForRefreshToken(
  token: string,
): Promise<{ user: User } | undefined> {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt), // just null check
        gt(refreshTokens.expiresAt, new Date()), // greater than compare Date objects
      ),
    )
    .limit(1);

  return result;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const now = new Date();

  const [res] = await db
    .update(refreshTokens)
    .set({ updatedAt: now, revokedAt: now })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (!res) throw new DBError("Cannot revoke token");
}
