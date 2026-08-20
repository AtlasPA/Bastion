"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(100),
  body: z.string().trim().min(10, "Say a little more").max(2000),
});

export async function submitReview(productId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to leave a review." };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    title: formData.get("title") ?? "",
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the review." };
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Product not found." };

  // One review per user per product; editing resubmits for approval.
  await db.review.upsert({
    where: { productId_userId: { productId, userId: session.user.id } },
    update: { ...parsed.data, title: parsed.data.title || null, status: "PENDING" },
    create: {
      productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/products/${product.slug}`);
  return { ok: true as const };
}
