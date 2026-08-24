"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Marketplace fee math, rates current as of August 2026 (sources below).
function ebayNet(price: number) {
  const fvf = Math.min(price, 7500) * 0.1325 + Math.max(price - 7500, 0) * 0.0235;
  const perOrder = price <= 10 ? 0.3 : 0.4;
  return { fees: fvf + perOrder, label: "13.25% + order fee" };
}
function tcgplayerNet(price: number) {
  const fees = price * 0.1075 + price * 0.025 + 0.3;
  return { fees, label: "10.75% + 2.5% + $0.30" };
}
function mercariNet(price: number) {
  return { fees: price * 0.1, label: "10% flat" };
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function PayoutCalculatorPage() {
  const [raw, setRaw] = useState("100");
  const price = Math.max(0, parseFloat(raw) || 0);

  const rows = [
    { name: "eBay", ...ebayNet(price) },
    { name: "TCGplayer", ...tcgplayerNet(price) },
    { name: "Mercari", ...mercariNet(price) },
  ].map((r) => ({ ...r, net: Math.max(0, price - r.fees) }));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">
          What do you actually keep after fees?
        </h1>
        <p className="text-muted-foreground">
          Selling cards and games online looks free until the payout lands.
          Enter a sale price and see what each marketplace takes — before
          you&apos;ve paid for shipping supplies, driven to the post office,
          or waited weeks for a buyer.
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="price">
            Sale price ($)
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="w-36 text-lg"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-medium">Platform</th>
              <th className="px-4 py-2 font-medium">Fee structure</th>
              <th className="px-4 py-2 font-medium">Fees on this sale</th>
              <th className="px-4 py-2 font-medium">You keep</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.label}</td>
                <td className="px-4 py-3 tabular-nums text-destructive">
                  −{money(r.fees)}
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {money(r.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        And that&apos;s before the costs every marketplace sale carries:
        sleeves, mailers, and label printing; the trip to drop it off; refund
        risk when a buyer claims &quot;not as described&quot;; and the days or
        months an item sits listed before anyone buys.
      </p>

      <section className="space-y-3 rounded-xl border bg-secondary/50 px-6 py-6">
        <h2 className="font-display text-xl font-bold">
          Or skip all of it: one offer, one payout
        </h2>
        <p className="text-sm text-muted-foreground">
          Send us photos of your games and cards and we reply with a straight
          cash offer — no fees taken out, no shipping supplies, no waiting for
          the right buyer to scroll past. What we offer is what you get.
        </p>
        <Button size="lg" render={<Link href="/sell-to-us" />}>
          Get a cash offer
        </Button>
      </section>

      <p className="text-xs text-muted-foreground">
        Fee rates current as of August 2026: eBay trading-cards final value
        fee 13.25% (up to $7,500) plus $0.30–0.40 per order; TCGplayer
        marketplace commission 10.75% plus 2.5% + $0.30 processing; Mercari
        10% flat. Figures are estimates on the item price alone — marketplace
        fees often also apply to shipping and tax collected. Check each
        platform for current rates.
      </p>
    </div>
  );
}
