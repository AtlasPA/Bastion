import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

// Home shows live inventory — always render fresh.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latest = await db.product.findMany({
    where: { status: "ACTIVE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="space-y-12">
      <section className="rounded-xl border bg-secondary/50 px-6 py-14 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
          Bastion GameVault
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Used games and cards, graded honestly.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Every item at Bastion is inspected, condition-graded, and priced
          fairly. Browse the shop, or send us an offer on your collection.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" render={<Link href="/products" />}>
            Browse the shop
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/products?category=trading-cards" />}
          >
            Trading cards
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Latest arrivals
          </h2>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
