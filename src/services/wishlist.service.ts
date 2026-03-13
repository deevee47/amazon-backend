import { db } from "../db/connection.ts";
import { wishlistTable, productsTable } from "../db/schema.ts";
import { eq, and } from "drizzle-orm";

export async function getWishlistItems(sessionId: string) {
  return db
    .select({
      id: wishlistTable.id,
      createdAt: wishlistTable.createdAt,
      product: {
        id: productsTable.id,
        title: productsTable.title,
        price: productsTable.price,
        thumbnail: productsTable.thumbnail,
        stock: productsTable.stock,
        discountPercentage: productsTable.discountPercentage,
        rating: productsTable.rating,
        reviews: productsTable.reviews,
      },
    })
    .from(wishlistTable)
    .innerJoin(productsTable, eq(wishlistTable.productId, productsTable.id))
    .where(eq(wishlistTable.sessionId, sessionId));
}

export async function toggleWishlistItem(sessionId: string, productId: number) {
  const [existing] = await db
    .select()
    .from(wishlistTable)
    .where(
      and(
        eq(wishlistTable.sessionId, sessionId),
        eq(wishlistTable.productId, productId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .delete(wishlistTable)
      .where(
        and(
          eq(wishlistTable.sessionId, sessionId),
          eq(wishlistTable.productId, productId)
        )
      );
    return { action: "removed" };
  }

  await db.insert(wishlistTable).values({ sessionId, productId });
  return { action: "added" };
}

export async function clearWishlist(sessionId: string) {
  return db.delete(wishlistTable).where(eq(wishlistTable.sessionId, sessionId));
}
