import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

// Home shows live inventory; re-render at most once a minute so navigation
// stays instant even when the free-tier database is waking from idle.
export const revalidate = 60;

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
        {/* Wordmark styled after the logo: red BASTION, letterspaced blue GAMEVAULT */}
        <h1 className="font-display uppercase leading-none">
          <span className="block text-5xl font-bold tracking-tight text-brand-red sm:text-6xl">
            Bastion
          </span>
          <span className="mt-2 block text-xl font-semibold tracking-[0.42em] text-brand-blue sm:text-2xl [text-indent:0.42em]">
            GameVault
          </span>
        </h1>
        <p className="mt-5 font-display text-2xl font-semibold tracking-tight">
          Retro games and trading cards, bought and sold.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Browse the shop for videogames and trading cards — or send us an
          offer on your collection.
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
