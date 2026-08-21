import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

function CountPill({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground tabular-nums">
      {count}
    </span>
  );
}

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  // "Needs attention" counts, shown as badges in the nav.
  const [toShip, newOffers, pendingReviews, pendingPrices] = await Promise.all([
    db.order.count({ where: { status: "PAID" } }),
    db.offerSubmission.count({ where: { status: "NEW" } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.priceChange.count({ where: { status: "PENDING" } }),
  ]);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/products" className="hover:underline">
            Products
          </Link>
          <Link href="/admin/categories" className="hover:underline">
            Categories
          </Link>
          <Link href="/admin/orders" className="hover:underline">
            Orders
            <CountPill count={toShip} />
          </Link>
          <Link href="/admin/offers" className="hover:underline">
            Offers
            <CountPill count={newOffers} />
          </Link>
          <Link href="/admin/reviews" className="hover:underline">
            Reviews
            <CountPill count={pendingReviews} />
          </Link>
          <Link href="/admin/pricing" className="hover:underline">
            Pricing
            <CountPill count={pendingPrices} />
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {session.user.email}
          </span>
          <form action={handleSignOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
