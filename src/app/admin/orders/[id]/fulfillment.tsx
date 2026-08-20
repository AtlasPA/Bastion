"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActionResult = { error?: string; ok?: boolean } | undefined | void;

export function BuyLabelForm({
  action,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          const res = await action(fd);
          if (res?.error) setError(res.error);
        })
      }
      className="space-y-3"
    >
      <div className="grid grid-cols-4 gap-2">
        {(
          [
            ["weightOz", "Weight (oz)", "8"],
            ["lengthIn", "Length (in)", "9"],
            ["widthIn", "Width (in)", "6"],
            ["heightIn", "Height (in)", "3"],
          ] as const
        ).map(([name, label, def]) => (
          <div key={name} className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor={name}>
              {label}
            </label>
            <Input
              id={name}
              name={name}
              type="number"
              step="0.1"
              min="0.1"
              defaultValue={def}
              required
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Buying label…" : "Buy cheapest label & mark shipped"}
      </Button>
    </form>
  );
}

export function TrackingForm({
  action,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          const res = await action(fd);
          if (res?.error) setError(res.error);
        })
      }
      className="flex flex-wrap items-end gap-2"
    >
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="carrier">
          Carrier
        </label>
        <Input id="carrier" name="carrier" placeholder="USPS" className="w-28" />
      </div>
      <div className="flex-1 space-y-1">
        <label
          className="text-xs text-muted-foreground"
          htmlFor="trackingNumber"
        >
          Tracking number
        </label>
        <Input
          id="trackingNumber"
          name="trackingNumber"
          required
          placeholder="9400 1000 0000 …"
        />
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Mark shipped"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </form>
  );
}
