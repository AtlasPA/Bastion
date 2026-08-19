import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteImage,
  deleteProduct,
  updateProduct,
  uploadImages,
} from "../actions";
import { ProductForm } from "../product-form";
import { PriceChartingPanel } from "../pricecharting-panel";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const update = updateProduct.bind(null, product.id);
  const upload = uploadImages.bind(null, product.id);
  const remove = deleteProduct.bind(null, product.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Edit product</h1>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          View in store →
        </Link>
      </div>

      <ProductForm action={update} categories={categories} product={product} />

      <PriceChartingPanel title={product.title} />

      <section className="max-w-xl space-y-3 border-t pt-6">
        <h2 className="font-medium">Photos</h2>
        {product.images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {product.images.map((image) => (
              <div key={image.id} className="space-y-1">
                <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <form action={deleteImage.bind(null, image.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="xs"
                    className="w-full text-destructive"
                  >
                    Remove
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
        <form action={upload} className="flex items-center gap-2">
          <Input type="file" name="files" accept="image/*" multiple required />
          <Button type="submit" variant="secondary">
            Upload
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Up to 8 photos per upload. The first photo is the cover image.
        </p>
      </section>

      <section className="max-w-xl space-y-2 border-t pt-6">
        <h2 className="font-medium text-destructive">Danger zone</h2>
        <form action={remove}>
          <Button type="submit" variant="destructive" size="sm">
            Delete product
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Products that have been ordered are archived instead of deleted, so
          order history stays intact.
        </p>
      </section>
    </div>
  );
}
