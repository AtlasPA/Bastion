import { Button } from "@/components/ui/button";
import { PreviewBadge } from "@/components/preview-badge";
import { formatCents } from "@/lib/format";

/**
 * Preview of the PriceCharting integration: at launch this panel searches
 * PriceCharting, links the product, and caches live suggested prices.
 * Suggested prices are never auto-applied — pricing stays a human decision.
 */
export function PriceChartingPanel({ title }: { title: string }) {
  const samples = [
    { label: "Loose", cents: 3450 },
    { label: "Complete (CIB)", cents: 6825 },
    { label: "New / Sealed", cents: 24900 },
  ];

  return (
    <section className="max-w-xl space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">PriceCharting suggested prices</h2>
        <PreviewBadge />
      </div>
      <p className="text-xs text-muted-foreground">
        Sample numbers for “{title}”. At launch this searches PriceCharting,
        links the exact product, and refreshes market prices daily. Suggestions
        never overwrite your price automatically.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {samples.map((s) => (
          <div
            key={s.label}
            className="space-y-1 rounded-md border bg-card p-3 text-center"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-semibold tabular-nums">{formatCents(s.cents)}</p>
            <Button size="xs" variant="outline" disabled className="w-full">
              Use this price
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Last refreshed: (daily refresh at launch)
      </p>
    </section>
  );
}
