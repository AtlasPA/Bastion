import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Your account" };

const STATUS_LABELS = {
  PENDING: "Processing",
  PAID: "Preparing to ship",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account");

  // Orders placed while signed in, plus guest orders under the same email.
  const orders = await db.order.findMany({
    where: {
      status: { not: "PENDING" },
      OR: [
        { userId: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Your account</h1>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          {session.user.role === "ADMIN" && (
            <Button variant="secondary" size="sm" render={<Link href="/admin" />}>
              Admin
            </Button>
          )}
          <form action={handleSignOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Order history</h2>
        {orders.length === 0 && (
          <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
            No orders yet —{" "}
            <Link href="/products" className="underline">
              the shop awaits
            </Link>
            .
          </p>
        )}
        {orders.map((order) => (
          <div key={order.id} className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {order.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{STATUS_LABELS[order.status]}</Badge>
                <span className="font-semibold tabular-nums">
                  {formatCents(order.totalCents)}
                </span>
              </div>
            </div>
            <ul className="space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity > 1 ? `${item.quantity} × ` : ""}
                  {item.titleSnapshot}
                </li>
              ))}
            </ul>
            {order.trackingNumber && (
              <p className="text-xs text-muted-foreground">
                {order.carrier ? `${order.carrier} — ` : ""}Tracking:{" "}
                <span className="font-mono">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
