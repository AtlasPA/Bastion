import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { shippoConfigured } from "@/lib/shippo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { CONDITION_LABELS } from "@/lib/conditions";
import { addTracking, buyLabel, setOrderStatus } from "../actions";
import { BuyLabelForm, TrackingForm } from "./fulfillment";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const refund = setOrderStatus.bind(null, order.id, "REFUNDED" as const);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">
            Order{" "}
            <span className="font-mono text-lg text-muted-foreground">
              {order.id.slice(-8)}
            </span>
          </h1>
          <Badge>{order.status}</Badge>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← All orders
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border bg-card p-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer
          </h2>
          <p>{order.shippingName ?? "—"}</p>
          <p className="text-muted-foreground">{order.email || "—"}</p>
          <h2 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ship to
          </h2>
          <p>
            {order.shippingStreet1}
            {order.shippingStreet2 ? `, ${order.shippingStreet2}` : ""}
            <br />
            {order.shippingCity}, {order.shippingState} {order.shippingZip}
          </p>
        </section>

        <section className="rounded-lg border bg-card p-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Items
          </h2>
          <ul className="space-y-1">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span>
                  {i.quantity > 1 ? `${i.quantity} × ` : ""}
                  {i.titleSnapshot}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({CONDITION_LABELS[i.conditionSnapshot]})
                  </span>
                </span>
                <span className="tabular-nums">
                  {formatCents(i.priceCentsSnapshot * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t pt-2">
            <div className="flex justify-between text-muted-foreground">
              <dt>Shipping</dt>
              <dd className="tabular-nums">{formatCents(order.shippingCents)}</dd>
            </div>
            {order.taxCents > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatCents(order.taxCents)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCents(order.totalCents)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {order.status === "PAID" && (
        <section className="space-y-4 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Ship it</h2>
          {shippoConfigured() ? (
            <BuyLabelForm action={buyLabel.bind(null, order.id)} />
          ) : (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Connect Shippo to buy discounted labels with one click here.
              Until then, buy postage anywhere and enter tracking below.
            </p>
          )}
          <div className="border-t pt-4">
            <TrackingForm action={addTracking.bind(null, order.id)} />
          </div>
        </section>
      )}

      {order.status === "SHIPPED" && (
        <section className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 text-sm">
          <div>
            <p className="font-medium">
              Shipped{order.carrier ? ` via ${order.carrier}` : ""}
            </p>
            <p className="text-muted-foreground">
              Tracking: {order.trackingNumber}
            </p>
          </div>
          {order.labelUrl && (
            <Button
              variant="secondary"
              size="sm"
              render={
                <a href={order.labelUrl} target="_blank" rel="noreferrer" />
              }
            >
              Open label PDF
            </Button>
          )}
        </section>
      )}

      {(order.status === "PAID" || order.status === "SHIPPED") && (
        <section className="space-y-2 border-t pt-4">
          <h2 className="text-sm font-medium text-destructive">Refunds</h2>
          <p className="text-xs text-muted-foreground">
            Refund the payment in the Stripe dashboard first, then mark the
            order refunded here. Stock is not restored automatically.
          </p>
          <form action={refund}>
            <Button type="submit" variant="destructive" size="sm">
              Mark refunded
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
