import { db } from "../db/connection.ts";
import { cartItemsTable, productsTable } from "../db/schema.ts";
import { eq, and, sql } from "drizzle-orm";

export async function getCartItems(sessionId: string) {
  return db
    .select({
      id: cartItemsTable.id,
      sessionId: cartItemsTable.sessionId,
      quantity: cartItemsTable.quantity,
      product: {
        id: productsTable.id,
        title: productsTable.title,
        price: productsTable.price,
        thumbnail: productsTable.thumbnail,
        stock: productsTable.stock,
        discountPercentage: productsTable.discountPercentage,
      },
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));
}

export async function upsertCartItem(
  sessionId: string,
  productId: number,
  quantity: number
) {
  return db
    .insert(cartItemsTable)
    .values({ sessionId, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItemsTable.sessionId, cartItemsTable.productId],
      set: {
        quantity: sql`${cartItemsTable.quantity} + ${quantity}`,
        updatedAt: new Date(),
      },
    })
    .returning();
}

export async function updateCartItemQuantity(
  sessionId: string,
  productId: number,
  quantity: number
) {
  return db
    .update(cartItemsTable)
    .set({ quantity, updatedAt: new Date() })
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId)
      )
    )
    .returning();
}

export async function removeCartItem(sessionId: string, productId: number) {
  return db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId)
      )
    )
    .returning();
}

export async function clearCart(sessionId: string) {
  return db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));
}
