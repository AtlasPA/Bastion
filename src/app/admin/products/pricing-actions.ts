"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { searchCards, type CardSearchResult } from "@/lib/pricing/sources";
import { repriceProduct } from "@/lib/pricing/engine";
import type { PriceSource } from "@/generated/prisma/client";

const sourceSchema = z.enum(["POKEMONTCG", "SCRYFALL", "YGOPRODECK"]);

export async function searchCardsAction(
  source: PriceSource,
  query: string
): Promise<{ results?: CardSearchResult[]; error?: string }> {
  await requireAdmin();
  const parsedSource = sourceSchema.safeParse(source);
  const q = query.trim();
  if (!parsedSource.success) return { error: "Pick a card game first." };
  if (q.length < 2) return { error: "Type at least 2 characters." };
  try {
    return { results: await searchCards(parsedSource.data, q) };
  } catch (e) {
    return { error: `Search failed: ${(e as Error).message}` };
  }
}

export async function linkPriceSource(
  productId: string,
  source: PriceSource,
  sourceId: string
) {
  await requireAdmin();
  sourceSchema.parse(source);
  await db.product.update({
    where: { id: productId },
    data: {
      priceSource: source,
      priceSourceId: z.string().min(3).max(200).parse(sourceId),
      marketCents: null,
      marketFetchedAt: null,
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function unlinkPriceSource(productId: string) {
  await requireAdmin();
  await db.product.update({
    where: { id: productId },
    data: {
      priceSource: null,
      priceSourceId: null,
      marketCents: null,
      marketFetchedAt: null,
      autoPricing: false,
    },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setAutoPricing(productId: string, enabled: boolean) {
  await requireAdmin();
  const product = await db.product.findUniqueOrThrow({
    where: { id: productId },
  });
  if (enabled && (!product.costCents || !product.priceSourceId)) {
    return {
      error:
        "Auto-pricing needs a linked card AND your cost (so the 25% profit floor works).",
    };
  }
  await db.product.update({
    where: { id: productId },
    data: { autoPricing: enabled },
  });
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true as const };
}

export async function repriceNow(productId: string) {
  await requireAdmin();
  const product = await db.product.findUniqueOrThrow({
    where: { id: productId },
  });
  const outcome = await repriceProduct(product);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/pricing");
  if (outcome.kind === "skipped") return { error: outcome.reason };
  return { ok: true as const, outcome: outcome.kind };
}

export async function resolvePriceChange(
  changeId: string,
  approve: boolean
) {
  await requireAdmin();
  const change = await db.priceChange.findUniqueOrThrow({
    where: { id: changeId },
    include: { product: true },
  });
  if (change.status !== "PENDING") return;

  if (approve) {
    // Re-assert the profit floor at approval time.
    const floor = change.product.costCents
      ? Math.ceil(change.product.costCents * 1.25)
      : 0;
    const price = Math.max(change.newCents, floor);
    await db.$transaction([
      db.product.update({
        where: { id: change.productId },
        data: { priceCents: price },
      }),
      db.priceChange.update({
        where: { id: changeId },
        data: { status: "APPLIED", newCents: price },
      }),
    ]);
  } else {
    await db.priceChange.update({
      where: { id: changeId },
      data: { status: "DISMISSED" },
    });
  }
  revalidatePath("/admin/pricing");
}
