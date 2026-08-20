"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeTextarea } from "@/components/ui/native-select";

export function SendOfferForm({
  action,
  defaultAmount,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
  defaultAmount?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="text-sm font-medium text-green-700 dark:text-green-400">
        Offer emailed ✓ — replies go straight to your inbox.
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
          else setSent(true);
        })
      }
      className="space-y-3"
    >
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="amount">
            Offer amount ($)
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={defaultAmount}
            className="w-32"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Email offer"}
        </Button>
      </div>
      <NativeTextarea
        name="message"
        placeholder="Optional note — condition adjustments, pickup/shipping instructions, etc."
        className="min-h-16"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
