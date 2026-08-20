import { db } from "@/lib/db";
import { fetchMarketCents } from "./sources";
import type { Condition, Product } from "@/generated/prisma/client";

// Market prices reflect Near Mint; other conditions sell at a discount.
export const CONDITION_MULTIPLIERS: Record<Condition, number> = {
  SEALED: 1.0,
  NM: 1.0,
  LP: 0.85,
  MP: 0.7,
  HP: 0.55,
  DMG: 0.4,
};

export const MIN_PROFIT_MULTIPLIER = 1.25; // hard floor: cost × 1.25
export const DAILY_BOUND = 0.2; // auto-apply moves up to ±20%; beyond → approval queue
const MIN_PRICE_CENTS = 25;

/** Retail rounding: ≥$5 rounds up to .99, below that to the next quarter. */
export function roundRetail(cents: number): number {
  if (cents >= 500) {
    const rounded = Math.ceil((cents + 1) / 100) * 100 - 1;
    return rounded >= cents ? rounded : rounded + 100;
  }
  return Math.max(MIN_PRICE_CENTS, Math.ceil(cents / 25) * 25);
}

export type RepriceOutcome =
  | { kind: "applied"; newCents: number }
  | { kind: "pending"; newCents: number }
  | { kind: "unchanged" }
  | { kind: "skipped"; reason: string };

/**
 * Computes and applies the new price for one product:
 *   market × condition multiplier → retail rounding → profit floor.
 * Moves within ±20%/day auto-apply; larger moves queue for approval.
 * The profit floor is absolute: a price below cost × 1.25 is raised
 * immediately, bound or no bound.
 */
export async function repriceProduct(product: Product): Promise<RepriceOutcome> {
  if (!product.autoPricing) return { kind: "skipped", reason: "not enrolled" };
  if (!product.priceSource || !product.priceSourceId) {
    return { kind: "skipped", reason: "no market source linked" };
  }
  if (!product.costCents) {
    return { kind: "skipped", reason: "no cost set — profit floor unenforceable" };
  }

  let marketCents: number | null;
  try {
    marketCents = await fetchMarketCents(
      product.priceSource,
      product.priceSourceId
    );
  } catch (e) {
    return { kind: "skipped", reason: `source error: ${(e as Error).message}` };
  }
  if (!marketCents) {
    return { kind: "skipped", reason: "source returned no market price" };
  }

  await db.product.update({
    where: { id: product.id },
    data: { marketCents, marketFetchedAt: new Date() },
  });

  const floorCents = Math.ceil(product.costCents * MIN_PROFIT_MULTIPLIER);
  const computed = roundRetail(
    Math.round(marketCents * CONDITION_MULTIPLIERS[product.condition])
  );
  const target = Math.max(computed, roundRetail(floorCents));

  if (target === product.priceCents) return { kind: "unchanged" };

  const move = Math.abs(target - product.priceCents) / product.priceCents;
  const floorRaise = product.priceCents < floorCents; // below floor: fix now

  if (move <= DAILY_BOUND || floorRaise) {
    await db.$transaction([
      db.product.update({
        where: { id: product.id },
        data: { priceCents: target },
      }),
      db.priceChange.create({
        data: {
          productId: product.id,
          prevCents: product.priceCents,
          newCents: target,
          marketCents,
          status: "APPLIED",
          note: floorRaise
            ? "raised to profit floor (cost × 1.25)"
            : target === roundRetail(floorCents) && computed < floorCents
              ? "market below floor — held at cost × 1.25"
              : "market move within daily bound",
        },
      }),
    ]);
    return { kind: "applied", newCents: target };
  }

  // Big move: don't apply, queue for approval (replace any existing pending).
  await db.$transaction([
    db.priceChange.deleteMany({
      where: { productId: product.id, status: "PENDING" },
    }),
    db.priceChange.create({
      data: {
        productId: product.id,
        prevCents: product.priceCents,
        newCents: target,
        marketCents,
        status: "PENDING",
        note: `market moved ${Math.round(move * 100)}% — needs approval`,
      },
    }),
  ]);
  return { kind: "pending", newCents: target };
}

export async function repriceAll(): Promise<{
  applied: number;
  pending: number;
  unchanged: number;
  skipped: number;
}> {
  const products = await db.product.findMany({
    where: { autoPricing: true, status: { in: ["ACTIVE", "DRAFT"] } },
    orderBy: { marketFetchedAt: { sort: "asc", nulls: "first" } },
    take: 200,
  });

  const counts = { applied: 0, pending: 0, unchanged: 0, skipped: 0 };
  for (const product of products) {
    const outcome = await repriceProduct(product);
    counts[outcome.kind === "applied" ? "applied" : outcome.kind === "pending" ? "pending" : outcome.kind === "unchanged" ? "unchanged" : "skipped"]++;
    // Stay polite with the free APIs.
    await new Promise((r) => setTimeout(r, 150));
  }
  return counts;
}
