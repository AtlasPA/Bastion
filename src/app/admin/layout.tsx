import Link from "next/link";
import { requireAdmin, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await requireAdmin();

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
