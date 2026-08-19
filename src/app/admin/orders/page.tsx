import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewBadge, PreviewNotice } from "@/components/preview-badge";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

// Sample data illustrating the Phase 3 orders workflow.
const SAMPLE_ORDERS = [
  {
    id: "#1042",
    customer: "marcus@example.com",
    items: "Chrono Trigger (SNES)",
    totalCents: 14293,
    status: "PAID",
    action: "Buy shipping label",
  },
  {
    id: "#1041",
    customer: "jess@example.com",
    items: "Charizard Holo Base Set +1 more",
    totalCents: 28442,
    status: "SHIPPED",
    action: "Track: 9405 5036 9930 …",
  },
  {
    id: "#1040",
    customer: "devon@example.com",
    items: "Halo 2 (Xbox)",
    totalCents: 1592,
    status: "SHIPPED",
    action: "Track: 9405 5036 9922 …",
  },
  {
    id: "#1039",
    customer: "sam@example.com",
    items: "Umbreon VMAX Alt Art",
    totalCents: 42499,
    status: "REFUNDED",
    action: "—",
  },
];

const STATUS_VARIANT = {
  PAID: "default",
  SHIPPED: "secondary",
  REFUNDED: "outline",
} as const;

export default async function AdminOrdersPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <PreviewBadge />
      </div>
      <PreviewNotice>
        Sample data showing the launch workflow: paid orders arrive here, one
        click buys a discounted USPS label via Shippo, and the customer gets a
        tracking email automatically.
      </PreviewNotice>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Shipping</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ORDERS.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                <td className="px-3 py-2">{o.customer}</td>
                <td className="px-3 py-2">{o.items}</td>
                <td className="px-3 py-2 tabular-nums">
                  {formatCents(o.totalCents)}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant={
                      STATUS_VARIANT[o.status as keyof typeof STATUS_VARIANT]
                    }
                  >
                    {o.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  {o.action.startsWith("Buy") ? (
                    <Button size="xs" variant="secondary" disabled>
                      {o.action}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {o.action}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
