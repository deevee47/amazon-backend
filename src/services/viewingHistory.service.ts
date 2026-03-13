import { db } from "../db/connection.ts";
import { viewingHistoryTable, productsTable } from "../db/schema.ts";
import { eq, desc } from "drizzle-orm";

export async function getHistory(sessionId: string, limit = 20) {
  return db
    .select({
      id: viewingHistoryTable.id,
      viewedAt: viewingHistoryTable.viewedAt,
      product: {
        id: productsTable.id,
        title: productsTable.title,
        price: productsTable.price,
        thumbnail: productsTable.thumbnail,
        rating: productsTable.rating,
        discountPercentage: productsTable.discountPercentage,
      },
    })
    .from(viewingHistoryTable)
    .innerJoin(
      productsTable,
      eq(viewingHistoryTable.productId, productsTable.id)
    )
    .where(eq(viewingHistoryTable.sessionId, sessionId))
    .orderBy(desc(viewingHistoryTable.viewedAt))
    .limit(limit);
}

export async function addToHistory(sessionId: string, productId: number) {
  return db
    .insert(viewingHistoryTable)
    .values({ sessionId, productId })
    .returning();
}

export async function clearHistory(sessionId: string) {
  return db
    .delete(viewingHistoryTable)
    .where(eq(viewingHistoryTable.sessionId, sessionId));
}
