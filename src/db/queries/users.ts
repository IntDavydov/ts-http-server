import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { type NewUser, type User, users } from "../schema.js";

export async function createUser(user: NewUser): Promise<User | undefined> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing() // return undefined
    .returning(); // return user object

  return result;
}

export async function deleteUsers(): Promise<number> {
  const result = await db.delete(users);

  return result.count;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [result] = await db.select().from(users).where(eq(users.email, email));

  return result;
}

export async function getUserById(
  userId: string,
): Promise<User | undefined> {
  const [result] = await db.select().from(users).where(eq(users.id, userId));

  return result;
}
