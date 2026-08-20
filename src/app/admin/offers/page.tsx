import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Offers" };

const STATUS_VARIANT = {
  NEW: "default",
  REVIEWING: "secondary",
  OFFER_SENT: "secondary",
  ACCEPTED: "outline",
  DECLINED: "outline",
  COMPLETED: "outline",
} as const;

export default async function AdminOffersPage() {
  await requireAdmin();
  const offers = await db.offerSubmission.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Offer submissions</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">From</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Asking</th>
              <th className="px-3 py-2 font-medium">Our offer</th>
              <th className="px-3 py-2 font-medium">Photos</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                  <Link
                    href={`/admin/offers/${o.id}`}
                    className="font-medium hover:underline"
                  >
                    {o.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {o.name}
                  <span className="block text-xs text-muted-foreground">
                    {o.email}
                  </span>
                </td>
                <td className="max-w-72 truncate px-3 py-2">{o.description}</td>
                <td className="px-3 py-2 tabular-nums">
                  {o.askingPriceCents ? formatCents(o.askingPriceCents) : "—"}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {o.offerCents ? formatCents(o.offerCents) : "—"}
                </td>
                <td className="px-3 py-2 tabular-nums">{o._count.photos}</td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[o.status]}>
                    {o.status.replace("_", " ")}
                  </Badge>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No submissions yet — they arrive here from the Sell to Us
                  page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
