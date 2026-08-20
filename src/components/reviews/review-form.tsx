"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeTextarea } from "@/components/ui/native-select";

export function ReviewForm({
  action,
  existing,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
  existing?: { rating: number; title: string | null; body: string } | null;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        Thanks! Your review is in — it appears once it&apos;s approved.
      </p>
    );
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          const res = await action(fd);
          if (res?.error) setError(res.error);
          else setDone(true);
        })
      }
      className="space-y-3 rounded-lg border bg-card p-4"
    >
      <h3 className="text-sm font-semibold">
        {existing ? "Edit your review" : "Write a review"}
      </h3>
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`size-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
            />
          </button>
        ))}
      </div>
      <Input
        name="title"
        placeholder="Title (optional)"
        defaultValue={existing?.title ?? ""}
        maxLength={100}
      />
      <NativeTextarea
        name="body"
        required
        minLength={10}
        maxLength={2000}
        defaultValue={existing?.body}
        placeholder="How was the condition, packaging, speed?"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
