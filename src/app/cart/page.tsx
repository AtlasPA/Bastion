"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";

export default function CartPage() {
  const { items, subtotalCents, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Everything in the vault is one of a kind — when it&apos;s gone,
          it&apos;s gone.
        </p>
        <Button render={<Link href="/products" />}>Browse the shop</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Cart</h1>
      <ul className="divide-y rounded-lg border bg-card">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="line-clamp-2 text-sm font-medium hover:underline"
              >
                {item.title}
              </Link>
              <button
                onClick={() => remove(item.productId)}
                className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
            <span className="font-semibold tabular-nums">
              {formatCents(item.priceCents)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Subtotal — shipping &amp; tax calculated at checkout
        </span>
        <span className="text-lg font-bold tabular-nums">
          {formatCents(subtotalCents)}
        </span>
      </div>
      <div className="flex justify-end">
        <Button size="lg" render={<Link href="/checkout" />}>
          Continue to checkout
        </Button>
      </div>
    </div>
  );
}
