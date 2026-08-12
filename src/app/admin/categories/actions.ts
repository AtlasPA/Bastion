"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const nameSchema = z.string().trim().min(1, "Name is required");

function revalidate() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = nameSchema.parse(formData.get("name"));

  const base = slugify(name) || "category";
  let slug = base;
  for (let i = 2; await db.category.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  await db.category.create({ data: { name, slug } });
  revalidate();
}

export async function renameCategory(id: string, formData: FormData) {
  await requireAdmin();
  const name = nameSchema.parse(formData.get("name"));
  await db.category.update({ where: { id }, data: { name } });
  revalidate();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error("Move or delete this category's products first.");
  }
  await db.category.delete({ where: { id } });
  revalidate();
}
