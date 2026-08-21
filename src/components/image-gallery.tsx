"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImageGallery({
  images,
  alt,
}: {
  images: { id: string; url: string }[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  return (
    <div className="space-y-2">
      <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={alt}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn(
                "aspect-square overflow-hidden rounded-md border bg-muted transition-opacity",
                i === selected
                  ? "ring-2 ring-ring"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
