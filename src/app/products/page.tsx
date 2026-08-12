import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { SearchFilters } from "./search-filters";

export const metadata: Metadata = { title: "Shop" };

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const categorySlug =
    typeof params.category === "string" ? params.category : "";

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
      <SearchFilters categories={categories} q={q} category={categorySlug} />
      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Nothing matched{q ? ` “${q}”` : ""}. Try a different search or
          category.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
