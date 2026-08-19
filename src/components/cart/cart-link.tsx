"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-context";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 hover:underline"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingCart className="size-4" aria-hidden />
      Cart
      {count > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-primary-foreground tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
