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
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  const orderBy =
    sort === "price-asc"
      ? { priceCents: "asc" as const }
      : sort === "price-desc"
        ? { priceCents: "desc" as const }
        : sort === "title"
          ? { title: "asc" as const }
          : { createdAt: "desc" as const };

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { images: true },
    orderBy,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Shop</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} item{products.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>
      </div>
      <SearchFilters
        categories={categories}
        q={q}
        category={categorySlug}
        sort={sort}
      />
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
