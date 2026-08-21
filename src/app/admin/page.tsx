import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboard() {
  // Pages render in parallel with the layout, so each admin page guards itself.
  await requireAdmin();
  const [active, draft, sold, categories, inventoryValue, recentOrders, recentOffers] =
    await Promise.all([
      db.product.count({ where: { status: "ACTIVE" } }),
      db.product.count({ where: { status: "DRAFT" } }),
      db.product.count({ where: { status: "SOLD" } }),
      db.category.count(),
      db.product.aggregate({
        where: { status: "ACTIVE" },
        _sum: { priceCents: true },
      }),
      db.order.findMany({
        where: { status: { not: "PENDING" } },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.offerSubmission.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Active listings", value: active },
    { label: "Drafts", value: draft },
    { label: "Sold", value: sold },
    { label: "Categories", value: categories },
    {
      label: "Inventory value",
      value: formatCents(inventoryValue._sum.priceCents ?? 0),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <Button render={<Link href="/admin/products/new" />}>
          Add product
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground hover:underline"
            >
              All orders →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="min-w-0 flex-1 truncate hover:underline"
                >
                  {o.items.map((i) => i.titleSnapshot).join(", ")}
                </Link>
                <span className="text-xs text-muted-foreground">{o.status}</span>
                <span className="font-medium tabular-nums">
                  {formatCents(o.totalCents)}
                </span>
              </li>
            ))}
            {recentOrders.length === 0 && (
              <li className="text-muted-foreground">No orders yet.</li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Recent offers</h2>
            <Link
              href="/admin/offers"
              className="text-xs text-muted-foreground hover:underline"
            >
              All offers →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentOffers.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/admin/offers/${o.id}`}
                  className="min-w-0 flex-1 truncate hover:underline"
                >
                  {o.name}: {o.description}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {o.status.replace("_", " ")}
                </span>
              </li>
            ))}
            {recentOffers.length === 0 && (
              <li className="text-muted-foreground">No offers yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
