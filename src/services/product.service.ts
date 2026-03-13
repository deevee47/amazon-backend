import { db } from "../db/connection.ts";
import { productsTable } from "../db/schema.ts";
import { ilike, eq, and, sql } from "drizzle-orm";

interface FindAllOptions {
  category?: string;
  search?: string;
  limit: number;
  offset: number;
}

// Columns returned in list view — omits full images array, uses first image as cover
const listColumns = {
  id: productsTable.id,
  title: productsTable.title,
  description: productsTable.description,
  price: productsTable.price,
  discountPercentage: productsTable.discountPercentage,
  rating: productsTable.rating,
  stock: productsTable.stock,
  brand: productsTable.brand,
  category: productsTable.category,
  thumbnail: productsTable.thumbnail,
  coverImage: sql<string>`(${productsTable.images}->0)`.as("cover_image"),
  tags: productsTable.tags,
  availabilityStatus: productsTable.availabilityStatus,
  minimumOrderQuantity: productsTable.minimumOrderQuantity,
};

export async function findAll({ category, search, limit, offset }: FindAllOptions) {
  const conditions = [];
  if (category) conditions.push(eq(productsTable.category, category));
  if (search) conditions.push(ilike(productsTable.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db
      .select(listColumns)
      .from(productsTable)
      .where(where)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(where),
  ]);

  return {
    products,
    total: countResult[0]?.count ?? 0,
    limit,
    offset,
  };
}

// Full product — includes all images
export async function findById(id: number) {
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  return product ?? null;
}

export async function findAllCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable)
    .orderBy(productsTable.category);
  return rows.map((r) => r.category);
}
