import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, RefreshToken, refreshTokens } from "../schema.js";

export async function addRefreshToken(
  dbToken: NewRefreshToken,
): Promise<RefreshToken> {
  const [result] = await db
    .insert(refreshTokens)
    .values(dbToken)
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

export async function revokeRefreshToken(
  updatedAt: Date,
  refreshToken: string,
): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ updatedAt, revokedAt: updatedAt })
    .where(eq(refreshTokens.token, refreshToken));
}
