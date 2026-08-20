import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setReviewStatus } from "./actions";

export const metadata: Metadata = { title: "Reviews" };

const STATUS_VARIANT = {
  PENDING: "default",
  APPROVED: "secondary",
  REJECTED: "outline",
} as const;

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await db.review.findMany({
    include: {
      product: { select: { title: true, slug: true } },
      user: { select: { email: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Reviews</h1>
      <p className="text-xs text-muted-foreground">
        Pending reviews are invisible to customers until approved.
      </p>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </span>
                <Link
                  href={`/products/${r.product.slug}`}
                  className="font-medium hover:underline"
                >
                  {r.product.title}
                </Link>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {r.user.name ?? r.user.email} ·{" "}
                {r.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {r.title && <p className="text-sm font-semibold">{r.title}</p>}
            <p className="text-sm text-muted-foreground">{r.body}</p>
            <div className="flex gap-2">
              {r.status !== "APPROVED" && (
                <form action={setReviewStatus.bind(null, r.id, "APPROVED" as const)}>
                  <Button type="submit" size="xs">
                    Approve
                  </Button>
                </form>
              )}
              {r.status !== "REJECTED" && (
                <form action={setReviewStatus.bind(null, r.id, "REJECTED" as const)}>
                  <Button type="submit" size="xs" variant="outline">
                    Reject
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}
