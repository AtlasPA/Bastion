"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  product,
  soldOut,
}: {
  product: {
    productId: string;
    slug: string;
    title: string;
    priceCents: number;
    image: string | null;
  };
  soldOut: boolean;
}) {
  const { items, add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some((i) => i.productId === product.productId);

  if (soldOut) {
    return (
      <Button size="lg" disabled>
        Sold out
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      disabled={inCart && !justAdded}
      onClick={() => {
        add(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      }}
    >
      {justAdded ? "Added ✓" : inCart ? "In cart" : "Add to cart"}
    </Button>
  );
}
