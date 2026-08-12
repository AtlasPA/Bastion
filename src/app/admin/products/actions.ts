"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const productSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.enum(["SEALED", "NM", "LP", "MP", "HP", "DMG"]),
  status: z.enum(["DRAFT", "ACTIVE", "SOLD", "ARCHIVED"]),
  price: z.coerce.number().min(0, "Price can't be negative"),
  quantity: z.coerce.number().int().min(0),
  description: z.string().trim(),
  sku: z.string().trim(),
});

function parseProductForm(formData: FormData) {
  return productSchema.parse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    status: formData.get("status"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    description: formData.get("description") ?? "",
    sku: formData.get("sku") ?? "",
  });
}

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "item";
  let slug = base;
  for (let i = 2; ; i++) {
    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

async function nextSku() {
  const count = await db.product.count();
  for (let n = count + 1; ; n++) {
    const sku = `BAS-${String(n).padStart(4, "0")}`;
    if (!(await db.product.findUnique({ where: { sku } }))) return sku;
  }
}

function revalidateStore(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);

  const product = await db.product.create({
    data: {
      title: data.title,
      slug: await uniqueSlug(data.title),
      sku: data.sku || (await nextSku()),
      categoryId: data.categoryId,
      condition: data.condition,
      status: data.status,
      priceCents: Math.round(data.price * 100),
      quantity: data.quantity,
      description: data.description,
    },
  });

  revalidateStore(product.slug);
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseProductForm(formData);
  const existing = await db.product.findUniqueOrThrow({ where: { id } });

  const slug =
    data.title === existing.title
      ? existing.slug
      : await uniqueSlug(data.title, id);

  await db.product.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      sku: data.sku || existing.sku,
      categoryId: data.categoryId,
      condition: data.condition,
      status: data.status,
      priceCents: Math.round(data.price * 100),
      quantity: data.quantity,
      description: data.description,
    },
  });

  revalidateStore(existing.slug);
  revalidateStore(slug);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const product = await db.product.findUniqueOrThrow({
    where: { id },
    include: { images: true, _count: { select: { orderItems: true } } },
  });

  if (product._count.orderItems > 0) {
    // Keep order history intact — archive instead of deleting.
    await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  } else {
    for (const image of product.images) {
      if (image.url.startsWith("https://")) {
        await del(image.url).catch(() => {});
      }
    }
    await db.product.delete({ where: { id } });
  }

  revalidateStore(product.slug);
  redirect("/admin/products");
}

export async function uploadImages(productId: string, formData: FormData) {
  await requireAdmin();
  const product = await db.product.findUniqueOrThrow({
    where: { id: productId },
    include: { images: true },
  });

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 8);

  let sortOrder =
    product.images.reduce((max, i) => Math.max(max, i.sortOrder), -1) + 1;

  for (const file of files) {
    const blob = await put(`products/${productId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    await db.productImage.create({
      data: { productId, url: blob.url, sortOrder: sortOrder++ },
    });
  }

  revalidateStore(product.slug);
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteImage(imageId: string) {
  await requireAdmin();
  const image = await db.productImage.findUniqueOrThrow({
    where: { id: imageId },
    include: { product: true },
  });

  if (image.url.startsWith("https://")) {
    await del(image.url).catch(() => {});
  }
  await db.productImage.delete({ where: { id: imageId } });

  revalidateStore(image.product.slug);
  revalidatePath(`/admin/products/${image.productId}`);
}
