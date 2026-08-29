"use client";

import { useRef, useState, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeTextarea } from "@/components/ui/native-select";
import { submitRepair } from "../sell-to-us/actions";

export default function RepairsPage() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function onPhotosChange(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).slice(0, 8);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
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
        <h1 className="font-display text-3xl font-bold">Request received!</h1>
        <p className="text-muted-foreground">
          A confirmation is in your inbox. We&apos;ll look over the problem and
          reply with a repair quote, usually within a couple of days — and no
          work starts until you approve it.
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
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Console repair</h1>
        <p className="text-muted-foreground">
          Dead cartridge slot, drifting stick, disc drive that won&apos;t
          read, no video out — we fix the consoles we collect. Tell us
          what&apos;s wrong and we&apos;ll reply with a quote. Diagnosis
          costs nothing, and no work starts until you approve the price.
        </p>
      </div>

      <form
        ref={formRef}
        className="space-y-4"
        action={(formData) => {
          setError(null);
          const console_ = formData.get("console");
          const problem = formData.get("problem");
          formData.set(
            "description",
            `Console: ${console_}\n\n${problem}`
          );
          for (const photo of photos) formData.append("photos", photo);
          startTransition(async () => {
            const result = await submitRepair(formData);
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
          <label className="text-sm font-medium" htmlFor="console">
            What console is it?
          </label>
          <Input
            id="console"
            name="console"
            required
            placeholder="e.g. N64, Game Boy Color, PS2 slim, PSP-2000…"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="problem">
            What&apos;s it doing (or not doing)?
          </label>
          <NativeTextarea
            id="problem"
            name="problem"
            required
            minLength={10}
            placeholder="e.g. powers on but no picture over HDMI; left stick drifts hard right; cartridges need reseating five times before they boot…"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="photos">
            Photos{" "}
            <span className="font-normal text-muted-foreground">
              (optional, up to 8 — damage close-ups help us quote accurately)
            </span>
          </label>
          <Input
            id="photos"
            type="file"
            accept="image/*"
            multiple
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
          {pending ? "Sending…" : "Get a repair quote"}
        </Button>
      </form>
    </div>
  );
}
