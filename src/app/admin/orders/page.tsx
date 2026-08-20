import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

const STATUS_VARIANT = {
  PENDING: "outline",
  PAID: "default",
  SHIPPED: "secondary",
  CANCELLED: "outline",
  REFUNDED: "outline",
} as const;

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await db.order.findMany({
    where: { status: { not: "PENDING" } }, // pending = abandoned checkouts
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-xs text-muted-foreground">
          Paid orders appear here automatically. Abandoned checkouts are hidden.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium hover:underline"
                  >
                    {o.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.email || "—"}</td>
                <td className="max-w-64 truncate px-3 py-2">
                  {o.items.map((i) => i.titleSnapshot).join(", ")}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {formatCents(o.totalCents)}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[o.status]}>{o.status}</Badge>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {o.trackingNumber ?? "—"}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No orders yet — they'll show up here the moment someone pays.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
