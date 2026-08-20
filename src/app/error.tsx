"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">
        Something went sideways.
      </h1>
      <p className="text-muted-foreground">
        A temporary hiccup on our end — your cart is safe. Give it another try.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
