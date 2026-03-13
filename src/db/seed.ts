import { db } from "./connection.ts";
import { productsTable } from "./schema.ts";
import { sql } from "drizzle-orm";

const DUMMYJSON_URL = "https://dummyjson.com/products?limit=194&skip=0";
const FAKESTOREAPI_URL = "https://fakestoreapi.com/products";

function mapDummyJsonProduct(p: any) {
  return {
    title: p.title,
    description: p.description,
    price: String(p.price),
    discountPercentage: String(p.discountPercentage),
    rating: String(p.rating),
    stock: p.stock,
    brand: p.brand ?? null,
    category: p.category,
    thumbnail: p.thumbnail,
    images: p.images,
    tags: p.tags ?? [],
    sku: p.sku ?? null,
    weight: p.weight ? String(p.weight) : null,
    dimensions: p.dimensions ?? null,
    warrantyInformation: p.warrantyInformation ?? null,
    shippingInformation: p.shippingInformation ?? null,
    availabilityStatus: p.availabilityStatus ?? "In Stock",
    returnPolicy: p.returnPolicy ?? null,
    minimumOrderQuantity: p.minimumOrderQuantity ?? 1,
    meta: p.meta ?? null,
    reviews: p.reviews ?? [],
  };
}

function mapFakeStoreProduct(p: any) {
  const ratingCount = p.rating?.count ?? 0;
  const reviews = Array.from({ length: Math.min(ratingCount, 5) }, (_, i) => ({
    rating: Math.round(p.rating?.rate ?? 4),
    comment: "Great product!",
    date: new Date().toISOString(),
    reviewerName: `Reviewer ${i + 1}`,
    reviewerEmail: `reviewer${i + 1}@example.com`,
  }));

  return {
    title: p.title,
    description: p.description,
    price: String(p.price),
    discountPercentage: "0",
    rating: String(p.rating?.rate ?? "4.0"),
    stock: 50,
    brand: null,
    category: p.category,
    thumbnail: p.image,
    images: [p.image],
    tags: [p.category],
    sku: `FSA-${p.id}`,
    weight: null,
    dimensions: null,
    warrantyInformation: null,
    shippingInformation: "Ships in 3-5 business days",
    availabilityStatus: "In Stock",
    returnPolicy: "30 days return policy",
    minimumOrderQuantity: 1,
    meta: null,
    reviews,
  };
}

async function seed() {
  // ── DummyJSON ────────────────────────────────────────────────
  console.log("Fetching products from DummyJSON...");
  const djRes = await fetch(DUMMYJSON_URL);
  const djData = (await djRes.json()) as { products: any[] };
  console.log(`Fetched ${djData.products.length} DummyJSON products.`);

  await db
    .insert(productsTable)
    .values(djData.products.map(mapDummyJsonProduct))
    .onConflictDoNothing();

  // ── FakeStoreAPI ─────────────────────────────────────────────
  console.log("Fetching products from FakeStoreAPI...");
  const fsRes = await fetch(FAKESTOREAPI_URL);
  const fsData = (await fsRes.json()) as any[];
  console.log(`Fetched ${fsData.length} FakeStoreAPI products.`);

  await db
    .insert(productsTable)
    .values(fsData.map(mapFakeStoreProduct))
    .onConflictDoNothing();

  // ── Summary ──────────────────────────────────────────────────
  const result = await db.execute(sql`SELECT COUNT(*)::text AS count FROM products`);
  const count = (result.rows?.[0] as any)?.count ?? (result as any)[0]?.count ?? "?";
  console.log(`Seeding complete! Total products in DB: ${count}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
