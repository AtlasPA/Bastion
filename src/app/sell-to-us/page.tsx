"use client";

import { useRef, useState, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeTextarea } from "@/components/ui/native-select";
import { submitOffer } from "./actions";

export default function SellToUsPage() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function onPhotosChange(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).slice(0, 8);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    // Compress phone photos before upload so submissions stay fast and small.
    const compressed = await Promise.all(
      files.map((f) =>
        imageCompression(f, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        }).catch(() => f)
      )
    );
    setPhotos(compressed);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Offer received!</h1>
        <p className="text-muted-foreground">
          Thanks — we&apos;ve got your photos and details, and a confirmation
          is in your inbox. We review every submission personally and usually
          reply with an offer within a couple of days.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setPhotos([]);
            setPreviews([]);
            formRef.current?.reset();
          }}
        >
          Submit something else
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">
          Sell us your games &amp; cards
        </h1>
        <p className="text-muted-foreground">
          Clearing out a collection? Send photos and a description — we&apos;ll
          reply with a real cash offer. No listing fees, no haggling in a
          parking lot.
        </p>
      </div>

      <form
        ref={formRef}
        className="space-y-4"
        action={(formData) => {
          setError(null);
          for (const photo of photos) formData.append("photos", photo);
          startTransition(async () => {
            const result = await submitOffer(formData);
            if (result?.error) setError(result.error);
            else setSubmitted(true);
          });
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
            name="description"
            required
            minLength={10}
            placeholder="e.g. ~40 GameCube games, mostly complete in box, plus a binder of holo Pokemon cards from 1999–2003…"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="askingPrice">
            Asking price (optional)
          </label>
          <Input
            id="askingPrice"
            name="askingPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="Leave blank for our best offer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="photos">
            Photos{" "}
            <span className="font-normal text-muted-foreground">
              (up to 8 — clear shots of labels, discs, and card fronts help us
              offer more)
            </span>
          </label>
          <Input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            required
            onChange={(e) => onPhotosChange(e.target.files)}
          />
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((src) => (
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

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send for an offer"}
        </Button>
      </form>
    </div>
  );
}
