import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { type Chirp, chirps, type NewChirp } from "../schema.js";

type AddChirpArgs = {
  body: string;
  userId: string;
};

export async function addChirp({
  body,
  userId,
}: AddChirpArgs): Promise<Chirp | undefined> {
  const [result] = await db
    .insert(chirps)
    .values({ body, userId })
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function getChirps(): Promise<Chirp[] | undefined> {
  const result = await db.select().from(chirps).orderBy(chirps.createdAt);

  return result;
}

export async function getChirp(chirpId: string): Promise<Chirp | undefined> {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));

  return result;
}

type DeleteChirpArgs = {
  chirpId: string;
  userId: string;
};

export async function deleteChirp({
  chirpId,
  userId,
}: DeleteChirpArgs): Promise<Chirp | undefined> {
  const [result] = await db
    .delete(chirps)
    .where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId)))
    .returning();

  return result;
}
