import { db } from "../db/connection.ts";
import { ordersTable, orderItemsTable, productsTable } from "../db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { AppError } from "../types/index.ts";
import type { PlaceOrderBody } from "../types/index.ts";

export async function placeOrder(body: PlaceOrderBody) {
  const { email, shippingAddress, paymentMethod, items } = body;

  return db.transaction(async (tx) => {
    // 1. Look up all products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await Promise.all(
      productIds.map((id) =>
        tx
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, id))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      )
    );

    for (let i = 0; i < items.length; i++) {
      const product = products[i];
      const item = items[i]!;
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.title}" (available: ${product.stock})`,
          400
        );
      }
    }

    // 2. Compute total amount
    const amount = items.reduce((sum, item, i) => {
      const product = products[i]!;
      return sum + parseFloat(product.price) * item.quantity;
    }, 0);

    // 3. Insert order
    const [order] = await tx
      .insert(ordersTable)
      .values({
        email,
        amount: amount.toFixed(2),
        paymentMethod,
        shippingAddress,
        status: "pending",
      })
      .returning();

    // 4. Insert order items (snapshot price, name, thumbnail)
    const orderItems = await tx
      .insert(orderItemsTable)
      .values(
        items.map((item, i) => {
          const product = products[i]!;
          return {
            orderId: order!.id,
            productId: item.productId,
            name: product.title,
            price: product.price,
            quantity: item.quantity,
            thumbnail: product.thumbnail,
          };
        })
      )
      .returning();

    // 5. Decrement stock for each product
    await Promise.all(
      items.map((item) =>
        tx
          .update(productsTable)
          .set({ stock: sql`${productsTable.stock} - ${item.quantity}` })
          .where(eq(productsTable.id, item.productId))
      )
    );

    return { ...order!, items: orderItems };
  });
}

export async function findOrderById(id: string) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, id));

  return { ...order, items };
}

export async function findOrdersByEmail(email: string) {
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.email, email))
    .orderBy(sql`${ordersTable.createdAt} desc`);

  return orders;
}
