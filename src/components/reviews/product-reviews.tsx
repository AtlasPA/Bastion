import Link from "next/link";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitReview } from "./review-actions";
import { ReviewForm } from "./review-form";

function Stars({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export async function ProductReviews({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [reviews, session] = await Promise.all([
    db.review.findMany({
      where: { productId, status: "APPROVED" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    auth(),
  ]);

  const ownReview = session?.user?.id
    ? await db.review.findUnique({
        where: {
          productId_userId: { productId, userId: session.user.id },
        },
      })
    : null;

  const average =
    reviews.length > 0
      ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
      : null;

  return (
    <section className="space-y-4 border-t pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-bold">Customer reviews</h2>
        {average !== null && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Stars rating={average} />
            {average.toFixed(1)} · {reviews.length} review
            {reviews.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No reviews yet — be the first.
        </p>
      )}

      {reviews.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="space-y-1.5 rounded-lg border bg-card p-4"
            >
              <Stars rating={r.rating} />
              {r.title && <h3 className="text-sm font-semibold">{r.title}</h3>}
              <p className="text-sm text-muted-foreground">{r.body}</p>
              <p className="pt-1 text-xs text-muted-foreground">
                — {r.user.name ?? r.user.email.split("@")[0]}
              </p>
            </article>
          ))}
        </div>
      )}

      {session?.user ? (
        <div className="max-w-md">
          {ownReview?.status === "PENDING" && (
            <p className="mb-2 text-xs text-muted-foreground">
              Your review is awaiting approval — you can still edit it below.
            </p>
          )}
          <ReviewForm
            action={submitReview.bind(null, productId)}
            existing={ownReview}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/login?next=/products/${slug}`}
            className="underline hover:no-underline"
          >
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      )}
    </section>
  );
}
