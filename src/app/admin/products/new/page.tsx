import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">New product</h1>
      <p className="text-sm text-muted-foreground">
        Photos can be added after the product is created.
      </p>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
