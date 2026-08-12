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
  const [active, draft, sold, categories, inventoryValue] = await Promise.all([
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { status: "DRAFT" } }),
    db.product.count({ where: { status: "SOLD" } }),
    db.category.count(),
    db.product.aggregate({
      where: { status: "ACTIVE" },
      _sum: { priceCents: true },
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
    </div>
  );
}
