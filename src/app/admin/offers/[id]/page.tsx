import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeTextarea } from "@/components/ui/native-select";
import { formatCents } from "@/lib/format";
import { saveOfferNotes, sendOffer, setOfferStatus } from "../actions";
import { SendOfferForm } from "./send-offer-form";

export const metadata: Metadata = { title: "Offer" };

export default async function AdminOfferPage({
  params,
}: PageProps<"/admin/offers/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const offer = await db.offerSubmission.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!offer) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">
            Offer from {offer.name}
          </h1>
          <Badge>{offer.status.replace("_", " ")}</Badge>
        </div>
        <Link
          href="/admin/offers"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← All offers
        </Link>
      </div>

      <section className="space-y-3 rounded-lg border bg-card p-4 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <span className="text-muted-foreground">From:</span> {offer.name}{" "}
            &lt;{offer.email}&gt;
          </span>
          <span>
            <span className="text-muted-foreground">Received:</span>{" "}
            {offer.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>
            <span className="text-muted-foreground">Asking:</span>{" "}
            {offer.askingPriceCents
              ? formatCents(offer.askingPriceCents)
              : "open to offers"}
          </span>
        </div>
        <p className="whitespace-pre-wrap border-t pt-3">{offer.description}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">
          Photos ({offer.photos.length})
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {offer.photos.map((photo) => (
            <a
              key={photo.id}
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              className="aspect-square overflow-hidden rounded-md border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </a>
          ))}
        </div>
      </section>

      {(offer.status === "NEW" || offer.status === "REVIEWING") && (
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Send an offer</h2>
          <SendOfferForm
            action={sendOffer.bind(null, offer.id)}
            defaultAmount={
              offer.askingPriceCents
                ? (offer.askingPriceCents / 100).toFixed(2)
                : undefined
            }
          />
        </section>
      )}

      {offer.offerCents && (
        <p className="text-sm">
          <span className="text-muted-foreground">Offer sent:</span>{" "}
          <span className="font-semibold">{formatCents(offer.offerCents)}</span>
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Status</h2>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["REVIEWING", "Reviewing"],
              ["ACCEPTED", "Accepted"],
              ["DECLINED", "Declined"],
              ["COMPLETED", "Completed"],
            ] as const
          ).map(([status, label]) => (
            <form key={status} action={setOfferStatus.bind(null, offer.id, status)}>
              <Button
                type="submit"
                size="sm"
                variant={offer.status === status ? "default" : "outline"}
              >
                {label}
              </Button>
            </form>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Private notes</h2>
        <form action={saveOfferNotes.bind(null, offer.id)} className="space-y-2">
          <NativeTextarea
            name="adminNotes"
            defaultValue={offer.adminNotes}
            placeholder="Only you see these — condition notes, counteroffers, pickup plans…"
          />
          <Button type="submit" variant="secondary" size="sm">
            Save notes
          </Button>
        </form>
      </section>
    </div>
  );
}
