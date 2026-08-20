import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns Policy" };

export default function ReturnsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-8 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-6">
      <h1 className="font-display text-3xl font-bold">Returns Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: August 2026</p>

      <h2>30-day returns</h2>
      <p>
        Not happy with something? Email bastiongamevault@gmail.com within 30
        days of delivery and we&apos;ll set up the return. Once the item is
        back and checked over, you get a full refund of the item price to your
        original payment method.
      </p>

      <h2>The fine print</h2>
      <p>
        Items must come back in the condition they were sent — same contents,
        same condition label. Return shipping is on you unless we made the
        mistake (wrong item, or condition clearly not as described — then we
        cover it and refund original shipping too).
      </p>

      <h2>Sealed products</h2>
      <p>
        Sealed items must still be sealed to be returnable. Once opened,
        they&apos;re yours.
      </p>

      <h2>Damaged in transit?</h2>
      <p>
        Email photos of the package and item within 48 hours of delivery and
        we&apos;ll make it right — replacement if we have one, refund if we
        don&apos;t.
      </p>
    </article>
  );
}
