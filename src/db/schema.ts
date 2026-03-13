import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  uuid,
  index,
  unique,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Products ────────────────────────────────────────────────────────────────

export const productsTable = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
    stock: integer("stock").notNull().default(0),
    brand: text("brand"),
    category: text("category").notNull(),
    thumbnail: text("thumbnail").notNull(),
    images: jsonb("images").notNull().default([]),
    tags: jsonb("tags").notNull().default([]),
    sku: text("sku").unique(),
    weight: numeric("weight", { precision: 8, scale: 2 }),
    dimensions: jsonb("dimensions"),
    warrantyInformation: text("warranty_information"),
    shippingInformation: text("shipping_information"),
    availabilityStatus: text("availability_status").notNull().default("In Stock"),
    returnPolicy: text("return_policy"),
    minimumOrderQuantity: integer("minimum_order_quantity").notNull().default(1),
    meta: jsonb("meta"),
    reviews: jsonb("reviews").notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("products_category_idx").on(table.category)]
);

// ─── Cart Items ───────────────────────────────────────────────────────────────

export const cartItemsTable = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("cart_items_session_idx").on(table.sessionId),
    unique("cart_items_session_product_unique").on(table.sessionId, table.productId),
  ]
);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  invoice: jsonb("invoice"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItemsTable = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    thumbnail: text("thumbnail"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)]
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const wishlistTable = pgTable(
  "wishlist",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("wishlist_session_idx").on(table.sessionId),
    unique("wishlist_session_product_unique").on(table.sessionId, table.productId),
  ]
);

// ─── Viewing History ──────────────────────────────────────────────────────────

export const viewingHistoryTable = pgTable(
  "viewing_history",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (table) => [
    index("viewing_history_session_idx").on(table.sessionId),
    index("viewing_history_product_idx").on(table.productId),
  ]
);

// ─── Addresses ────────────────────────────────────────────────────────────────

export const addressesTable = pgTable("addresses", {
  id:        serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  fullName:  text("full_name").notNull(),
  email:     text("email").default(""),
  mobile:    text("mobile").default(""),
  pincode:   text("pincode").default(""),
  flat:      text("flat").default(""),
  area:      text("area").default(""),
  landmark:  text("landmark").default(""),
  city:      text("city").default(""),
  state:     text("state").default(""),
  country:   text("country").default("India"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = typeof productsTable.$inferInsert;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type InsertCartItem = typeof cartItemsTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type InsertOrderItem = typeof orderItemsTable.$inferInsert;
export type WishlistItem = typeof wishlistTable.$inferSelect;
export type InsertWishlistItem = typeof wishlistTable.$inferInsert;
export type ViewingHistoryItem = typeof viewingHistoryTable.$inferSelect;
export type InsertViewingHistoryItem = typeof viewingHistoryTable.$inferInsert;
export type Address = typeof addressesTable.$inferSelect;
export type InsertAddress = typeof addressesTable.$inferInsert;
