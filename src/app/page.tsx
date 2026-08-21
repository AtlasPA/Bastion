import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

// Home shows live inventory; re-render at most once a minute so navigation
// stays instant even when the free-tier database is waking from idle.
export const revalidate = 60;

export default async function HomePage() {
  const [latest, categories] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.category.findMany({
      include: {
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
        products: {
          where: { status: "ACTIVE" },
          include: { images: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-xl border bg-secondary/50 px-6 py-14 text-center">
        <h1 className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Bastion GameVault"
            width={420}
            height={189}
            className="w-72 max-w-full sm:w-[420px]"
          />
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

      <section className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const cover = category.products[0]?.images[0];
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative flex h-40 items-end overflow-hidden rounded-xl border bg-secondary/40"
            >
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover.url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="relative p-5">
                <h2 className="font-display text-2xl font-bold">
                  {category.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {category._count.products} item
                  {category._count.products === 1 ? "" : "s"} in stock →
                </p>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
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

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-accent/60 px-6 py-8">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Got a collection to sell?
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Send us photos and a description — we reply with a real cash
            offer, usually within a couple of days. No fees, no meetups.
          </p>
        </div>
        <Button size="lg" render={<Link href="/sell-to-us" />}>
          Get an offer
        </Button>
      </section>
    </div>
  );
}
