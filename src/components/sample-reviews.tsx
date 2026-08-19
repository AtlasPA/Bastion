import { Star } from "lucide-react";
import { PreviewBadge } from "@/components/preview-badge";

const SAMPLE_REVIEWS = [
  {
    name: "Marcus T.",
    rating: 5,
    title: "Exactly as described",
    body: "Cart was cleaner than the photos let on. Save battery works. Shipped fast in a padded box.",
  },
  {
    name: "Jess R.",
    rating: 5,
    title: "Condition was spot on",
    body: "Card arrived sleeved, top-loaded, and matching the listed condition. Will buy again.",
  },
  {
    name: "Devon K.",
    rating: 4,
    title: "Solid pickup",
    body: "Fair price for the condition. Label wear was described honestly in the listing.",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function SampleReviews() {
  return (
    <section className="space-y-4 border-t pt-8">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-bold">Customer reviews</h2>
        <PreviewBadge />
      </div>
      <p className="text-xs text-muted-foreground">
        Sample reviews showing how this section will look — real customer
        reviews open at launch.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {SAMPLE_REVIEWS.map((r) => (
          <article key={r.name} className="space-y-1.5 rounded-lg border bg-card p-4">
            <Stars rating={r.rating} />
            <h3 className="text-sm font-semibold">{r.title}</h3>
            <p className="text-sm text-muted-foreground">{r.body}</p>
            <p className="pt-1 text-xs text-muted-foreground">— {r.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
