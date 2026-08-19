"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { PreviewNotice } from "@/components/preview-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCents } from "@/lib/format";

export default function CheckoutPage() {
  const { items, subtotalCents } = useCart();
  const shippingCents = items.length > 0 ? 499 : 0;
  const taxCents = Math.round(subtotalCents * 0.06);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <PreviewNotice>
        This is a preview of checkout. Payments aren&apos;t live yet — secure
        card, Apple&nbsp;Pay, and Google&nbsp;Pay checkout via Stripe arrives at
        launch.
      </PreviewNotice>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Shipping address
          </h2>
          <Input placeholder="Full name" disabled />
          <Input placeholder="Street address" disabled />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="City" disabled />
            <Input placeholder="ZIP" disabled />
          </div>
          <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Payment
          </h2>
          <div className="rounded-md border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
            Card / Apple Pay / Google Pay
            <br />
            <span className="text-xs">(hosted by Stripe at launch)</span>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Order summary
          </h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="line-clamp-1">{i.title}</span>
                <span className="tabular-nums">
                  {formatCents(i.priceCents)}
                </span>
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-muted-foreground">
                Your cart is empty —{" "}
                <Link href="/products" className="underline">
                  add something first
                </Link>
                .
              </li>
            )}
          </ul>
          <dl className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatCents(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping (flat rate)</dt>
              <dd className="tabular-nums">{formatCents(shippingCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estimated tax</dt>
              <dd className="tabular-nums">{formatCents(taxCents)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCents(totalCents)}</dd>
            </div>
          </dl>
          <Button className="w-full" size="lg" disabled>
            Pay {formatCents(totalCents)} — coming soon
          </Button>
        </section>
      </div>
    </div>
  );
}
