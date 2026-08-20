"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ReviewStatus } from "@/generated/prisma/client";

export async function setReviewStatus(id: string, status: ReviewStatus) {
  await requireAdmin();
  const review = await db.review.update({
    where: { id },
    data: { status },
    include: { product: true },
  });
  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${review.product.slug}`);
}
