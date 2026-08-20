"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { formatCents } from "@/lib/format";
import {
  linkPriceSource,
  repriceNow,
  searchCardsAction,
  setAutoPricing,
  unlinkPriceSource,
} from "./pricing-actions";
import type { CardSearchResult } from "@/lib/pricing/sources";
import type { PriceSource } from "@/generated/prisma/client";

const SOURCES: { value: PriceSource; label: string }[] = [
  { value: "POKEMONTCG", label: "Pokémon" },
  { value: "SCRYFALL", label: "Magic: The Gathering" },
  { value: "YGOPRODECK", label: "Yu-Gi-Oh!" },
];

export function MarketPanel({
  product,
}: {
  product: {
    id: string;
    priceSource: PriceSource | null;
    priceSourceId: string | null;
    marketCents: number | null;
    marketFetchedAt: string | null;
    autoPricing: boolean;
    costCents: number | null;
  };
}) {
  const [source, setSource] = useState<PriceSource>("POKEMONTCG");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardSearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const linked = Boolean(product.priceSourceId);

  function run(fn: () => Promise<{ error?: string } | void>) {
    setMessage(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setMessage(res.error);
    });
  }

  return (
    <section className="max-w-xl space-y-3 rounded-lg border bg-muted/30 p-4">
      <h2 className="text-sm font-semibold">Market pricing</h2>

      {linked ? (
        <div className="space-y-3">
          <div className="rounded-md border bg-card p-3 text-sm">
            <p className="font-mono text-xs text-muted-foreground">
              {product.priceSource} · {product.priceSourceId}
            </p>
            <p className="mt-1">
              Market:{" "}
              <span className="font-semibold tabular-nums">
                {product.marketCents ? formatCents(product.marketCents) : "not fetched yet"}
              </span>
              {product.marketFetchedAt && (
                <span className="text-xs text-muted-foreground">
                  {" "}
                  (as of {new Date(product.marketFetchedAt).toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => run(() => repriceNow(product.id))}
            >
              {pending ? "Working…" : "Fetch & reprice now"}
            </Button>
            <Button
              size="sm"
              variant={product.autoPricing ? "default" : "outline"}
              disabled={pending}
              onClick={() =>
                run(() => setAutoPricing(product.id, !product.autoPricing))
              }
            >
              {product.autoPricing ? "Auto-pricing ON" : "Auto-pricing OFF"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => unlinkPriceSource(product.id))}
            >
              Unlink
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Daily rule: market × condition − rounded to retail, never below
            cost × 1.25{product.costCents ? ` (${formatCents(Math.ceil(product.costCents * 1.25))})` : " — set your cost above to enable auto-pricing"}.
            Moves over ±20% wait in the Pricing queue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Link this product to its card so prices can follow the market.
          </p>
          <div className="flex gap-2">
            <NativeSelect
              value={source}
              onChange={(e) => setSource(e.target.value as PriceSource)}
              className="w-44"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </NativeSelect>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Card name…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  run(async () => {
                    const res = await searchCardsAction(source, query);
                    if (res.results) setResults(res.results);
                    return res;
                  });
                }
              }}
            />
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const res = await searchCardsAction(source, query);
                  if (res.results) setResults(res.results);
                  return res;
                })
              }
            >
              {pending ? "Searching…" : "Search"}
            </Button>
          </div>
          {results.length > 0 && (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {results.map((r) => (
                <li key={r.sourceId} className="rounded-md border bg-card p-2 text-sm">
                  <p className="font-medium">{r.label}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.variants.filter((v) => v.marketCents).map((v) => (
                      <Button
                        key={v.key}
                        size="xs"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            linkPriceSource(
                              product.id,
                              source,
                              `${r.sourceId}|${v.key}`
                            )
                          )
                        }
                      >
                        {v.label}: {formatCents(v.marketCents!)} — link
                      </Button>
                    ))}
                    {r.variants.every((v) => !v.marketCents) && (
                      <span className="text-xs text-muted-foreground">
                        no market price listed
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {message && <p className="text-sm text-destructive">{message}</p>}
    </section>
  );
}
