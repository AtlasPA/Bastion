import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-8 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-6">
      <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: August 2026</p>

      <h2>Who we are</h2>
      <p>
        Bastion GameVault sells used videogames and trading cards, and buys
        collections from the public. Using this site means you agree to these
        terms.
      </p>

      <h2>Condition of items</h2>
      <p>
        Everything we sell is pre-owned unless marked Sealed. Each listing
        shows a condition label (Near Mint, Lightly Played, Moderately Played,
        Heavily Played, Damaged) and photos of the actual item you&apos;ll
        receive. Games are tested and working unless stated otherwise.
      </p>

      <h2>Orders and pricing</h2>
      <p>
        Most of our inventory is one of a kind. In the rare case two people
        buy the same item at once, the second order is refunded in full. We
        occasionally correct pricing errors; if an order was placed at a
        clearly mistaken price we may cancel and refund it.
      </p>

      <h2>Selling to us</h2>
      <p>
        Offer submissions are invitations to negotiate — an emailed offer from
        us isn&apos;t binding on either side until items are received and
        verified. You must own what you sell us, and items must match the
        photos and descriptions submitted.
      </p>

      <h2>Returns</h2>
      <p>See our Returns Policy for the details.</p>

      <h2>Liability</h2>
      <p>
        Our liability for any order is limited to what you paid for it. We do
        our best on grading and descriptions but small disagreements about
        condition can happen — that&apos;s what the return window is for.
      </p>

      <h2>Contact</h2>
      <p>Questions: bastiongamevault@gmail.com</p>
    </article>
  );
}
