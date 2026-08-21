import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ImageGallery } from "@/components/image-gallery";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/reviews/product-reviews";
import {
  CONDITION_BADGE_CLASSES,
  CONDITION_LABELS,
} from "@/lib/conditions";
import { formatCents } from "@/lib/format";

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.title ?? "Not found" };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status === "DRAFT" || product.status === "ARCHIVED") {
    notFound();
  }

  const soldOut = product.status === "SOLD" || product.quantity < 1;
  const image = product.images[0];

  const related = await db.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="space-y-10">
    <div className="grid gap-8 md:grid-cols-2">
      <ImageGallery images={product.images} alt={product.title} />

      <div className="space-y-5">
        <div className="space-y-2">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {product.category.name}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold tabular-nums">
              {formatCents(product.priceCents)}
            </span>
            <Badge className={CONDITION_BADGE_CLASSES[product.condition]}>
              {CONDITION_LABELS[product.condition]}
            </Badge>
            {soldOut && <Badge variant="destructive">Sold out</Badge>}
          </div>
        </div>

        {product.description && (
          <p className="max-w-prose text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="space-y-2">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              priceCents: product.priceCents,
              image: image?.url ?? null,
            }}
            soldOut={soldOut}
          />
          <p className="text-xs text-muted-foreground">
            Checkout is in preview — payments go live at launch.
          </p>
        </div>

        <dl className="grid max-w-xs grid-cols-2 gap-y-1 border-t pt-4 text-sm">
          <dt className="text-muted-foreground">SKU</dt>
          <dd className="font-mono">{product.sku}</dd>
          <dt className="text-muted-foreground">Condition</dt>
          <dd>{CONDITION_LABELS[product.condition]}</dd>
          <dt className="text-muted-foreground">In stock</dt>
          <dd>{soldOut ? 0 : product.quantity}</dd>
        </dl>
      </div>
    </div>
    {related.length > 0 && (
      <section className="space-y-4 border-t pt-8">
        <h2 className="font-display text-xl font-bold">
          More {product.category.name.toLowerCase()}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    )}
    <ProductReviews productId={product.id} slug={product.slug} />
    </div>
  );
}
