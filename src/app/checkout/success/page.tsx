import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : "";

  const order = sessionId
    ? await db.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: { items: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-5 py-16 text-center">
      <ClearCart />
      <h1 className="font-display text-3xl font-bold">
        {order?.status === "PAID" ? "Order confirmed! 🎉" : "Thanks — almost done!"}
      </h1>
      {order ? (
        <>
          <p className="text-muted-foreground">
            {order.status === "PAID"
              ? "Payment received. We'll pack it up and email you tracking as soon as it ships."
              : "Your payment is processing — this page will show the confirmed order shortly, and you'll get an email either way."}
          </p>
          <div className="rounded-lg border bg-card p-4 text-left text-sm">
            <ul className="space-y-1">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3">
                  <span className="line-clamp-1">{i.titleSnapshot}</span>
                  <span className="tabular-nums">
                    {formatCents(i.priceCentsSnapshot)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCents(order.totalCents)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">
          We couldn&apos;t find that order — if you just paid, check your email
          for the confirmation.
        </p>
      )}
      <Button variant="outline" render={<Link href="/products" />}>
        Keep browsing
      </Button>
    </div>
  );
}
