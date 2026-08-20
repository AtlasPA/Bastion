"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { beginCheckout } from "./actions";

export function CheckoutButton() {
  const { items } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        size="lg"
        disabled={pending || items.length === 0}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await beginCheckout(
              items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
              }))
            );
            if (result?.error) setError(result.error);
          });
        }}
      >
        {pending ? "Opening secure checkout…" : "Continue to checkout"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Secure payment by Stripe — card, Apple Pay, or Google Pay.
      </p>
    </div>
  );
}
