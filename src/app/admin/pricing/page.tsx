import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { resolvePriceChange } from "../products/pricing-actions";

export const metadata: Metadata = { title: "Pricing" };

export default async function AdminPricingPage() {
  await requireAdmin();
  const [pendingChanges, recent, enrolled] = await Promise.all([
    db.priceChange.findMany({
      where: { status: "PENDING" },
      include: { product: { select: { title: true, id: true, costCents: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.priceChange.findMany({
      where: { status: { not: "PENDING" } },
      include: { product: { select: { title: true, id: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.product.count({ where: { autoPricing: true } }),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Pricing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enrolled} product{enrolled === 1 ? "" : "s"} on auto-pricing.
          Prices update daily: market × condition, rounded to retail, never
          below your cost × 1.25. Moves over ±20% land here for approval.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">
          Needs approval ({pendingChanges.length})
        </h2>
        {pendingChanges.length === 0 && (
          <p className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing waiting — all recent market moves were within the daily
            bound.
          </p>
        )}
        {pendingChanges.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 text-sm"
          >
            <div>
              <Link
                href={`/admin/products/${c.product.id}`}
                className="font-medium hover:underline"
              >
                {c.product.title}
              </Link>
              <p className="text-muted-foreground">
                {formatCents(c.prevCents)} →{" "}
                <span className="font-semibold text-foreground">
                  {formatCents(c.newCents)}
                </span>{" "}
                · {c.note}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={resolvePriceChange.bind(null, c.id, true)}>
                <Button type="submit" size="sm">
                  Apply
                </Button>
              </form>
              <form action={resolvePriceChange.bind(null, c.id, false)}>
                <Button type="submit" size="sm" variant="outline">
                  Dismiss
                </Button>
              </form>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Recent changes</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Change</th>
                <th className="px-3 py-2 font-medium">Why</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {c.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="max-w-56 truncate px-3 py-2">
                    <Link
                      href={`/admin/products/${c.product.id}`}
                      className="hover:underline"
                    >
                      {c.product.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {formatCents(c.prevCents)} → {formatCents(c.newCents)}
                  </td>
                  <td className="max-w-64 truncate px-3 py-2 text-xs text-muted-foreground">
                    {c.note}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={c.status === "APPLIED" ? "secondary" : "outline"}
                    >
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No price changes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
