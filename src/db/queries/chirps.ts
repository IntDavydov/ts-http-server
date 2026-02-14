import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { type Chirp, chirps, type NewChirp } from "../schema.js";

export async function addChirp(chirp: NewChirp): Promise<Chirp | undefined> {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
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

  return result
}
