import { db } from "../db/connection.ts";
import { ordersTable, orderItemsTable, productsTable } from "../db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { AppError } from "../types/index.ts";
import type { PlaceOrderBody } from "../types/index.ts";

export async function placeOrder(body: PlaceOrderBody) {
  const { email, shippingAddress, paymentMethod, items } = body;

  // 1. Look up all products sequentially and validate stock
  const products: (typeof productsTable.$inferSelect)[] = [];
  for (const item of items) {
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, item.productId))
      .limit(1);
    const product = rows[0];
    if (!product) {
      throw new AppError(`Product ${item.productId} not found`, 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.title}" (available: ${product.stock})`,
        400
      );
    }
    products.push(product);
  }

  // 2. Compute total amount
  const amount = items.reduce((sum, item, i) => {
    return sum + parseFloat(products[i]!.price) * item.quantity;
  }, 0);

  // 3. Insert order
  const [order] = await db
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
  const orderItems = await db
    .insert(orderItemsTable)
    .values(
      items.map((item, i) => ({
        orderId: order!.id,
        productId: item.productId,
        name: products[i]!.title,
        price: products[i]!.price,
        quantity: item.quantity,
        thumbnail: products[i]!.thumbnail,
      }))
    )
    .returning();

  // 5. Decrement stock for each product sequentially
  for (const item of items) {
    await db
      .update(productsTable)
      .set({ stock: sql`${productsTable.stock} - ${item.quantity}` })
      .where(eq(productsTable.id, item.productId));
  }

  return { ...order!, items: orderItems };
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
