import { db } from "../db/connection.ts";
import { addressesTable } from "../db/schema.ts";
import { eq, and, desc } from "drizzle-orm";

export async function getAddresses(sessionId: string) {
  return db
    .select()
    .from(addressesTable)
    .where(eq(addressesTable.sessionId, sessionId))
    .orderBy(desc(addressesTable.isDefault), desc(addressesTable.createdAt));
}

export async function createAddress(
  sessionId: string,
  data: {
    fullName: string;
    email?: string;
    mobile?: string;
    pincode?: string;
    flat?: string;
    area?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    isDefault?: boolean;
  }
) {
  if (data.isDefault) {
    await db
      .update(addressesTable)
      .set({ isDefault: false })
      .where(eq(addressesTable.sessionId, sessionId));
  }

  const [address] = await db
    .insert(addressesTable)
    .values({ sessionId, ...data })
    .returning();

  return address;
}

export async function setDefault(sessionId: string, id: number) {
  await db
    .update(addressesTable)
    .set({ isDefault: false })
    .where(eq(addressesTable.sessionId, sessionId));

  const [address] = await db
    .update(addressesTable)
    .set({ isDefault: true })
    .where(and(eq(addressesTable.id, id), eq(addressesTable.sessionId, sessionId)))
    .returning();

  return address;
}
