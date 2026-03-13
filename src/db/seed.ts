import { db } from "./connection.ts";
import { productsTable } from "./schema.ts";

const DUMMYJSON_URL = "https://dummyjson.com/products?limit=194&skip=0";

async function seed() {
  console.log("Fetching products from DummyJSON...");

  const res = await fetch(DUMMYJSON_URL);
  const data = (await res.json()) as { products: any[] };

  console.log(`Fetched ${data.products.length} products. Inserting...`);

  await db.insert(productsTable).values(
    data.products.map((p) => ({
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
    }))
  );

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
