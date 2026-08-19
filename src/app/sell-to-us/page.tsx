"use client";

import { useState } from "react";
import { PreviewNotice } from "@/components/preview-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeTextarea } from "@/components/ui/native-select";

export default function SellToUsPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Offer received!</h1>
        <p className="text-muted-foreground">
          This is what sellers will see: we review the photos and details, then
          reply with an offer by email — usually within a couple of days.
        </p>
        <PreviewNotice>
          Preview only — this submission wasn&apos;t saved. The real offer
          inbox opens at launch.
        </PreviewNotice>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Back to the form
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Sell us your games &amp; cards</h1>
        <p className="text-muted-foreground">
          Clearing out a collection? Send photos and a description — we&apos;ll
          reply with a real cash offer. No listing fees, no haggling in a
          parking lot.
        </p>
      </div>
      <PreviewNotice>
        Preview — the offer form isn&apos;t connected yet. Submissions here
        aren&apos;t saved or reviewed.
      </PreviewNotice>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            What are you selling?
          </label>
          <NativeTextarea
            id="description"
            required
            placeholder="e.g. ~40 GameCube games, mostly complete in box, plus a binder of holo Pokemon cards from 1999–2003…"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="asking">
            Asking price (optional)
          </label>
          <Input
            id="asking"
            type="number"
            min="0"
            step="0.01"
            placeholder="Leave blank for our best offer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="photos">
            Photos <span className="font-normal text-muted-foreground">(up to 8)</span>
          </label>
          <Input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).slice(0, 8);
              setPhotos(files.map((f) => URL.createObjectURL(f)));
            }}
          />
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-square rounded-md border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <Button type="submit" size="lg">
          Send for an offer
        </Button>
      </form>
    </div>
  );
}
