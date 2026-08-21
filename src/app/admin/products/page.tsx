import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { CONDITION_LABELS } from "@/lib/conditions";
import { formatCents } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };

const STATUS_VARIANT = {
  ACTIVE: "default",
  DRAFT: "secondary",
  SOLD: "outline",
  ARCHIVED: "outline",
} as const;

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "";

  const products = await db.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(status === "ACTIVE" || status === "DRAFT" || status === "SOLD" || status === "ARCHIVED"
        ? { status }
        : {}),
    },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>
          Add product
        </Button>
      </div>
      <form className="flex flex-wrap items-center gap-2" method="GET">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search title or SKU…"
          className="max-w-xs"
        />
        <NativeSelect name="status" defaultValue={status} className="w-36">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="SOLD">Sold</option>
          <option value="ARCHIVED">Archived</option>
        </NativeSelect>
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
        {(q || status) && (
          <Link
            href="/admin/products"
            className="text-xs text-muted-foreground hover:underline"
          >
            Clear
          </Link>
        )}
      </form>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Condition</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-medium hover:underline"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                <td className="px-3 py-2">{p.category.name}</td>
                <td className="px-3 py-2">{CONDITION_LABELS[p.condition]}</td>
                <td className="px-3 py-2 tabular-nums">
                  {formatCents(p.priceCents)}
                </td>
                <td className="px-3 py-2 tabular-nums">{p.quantity}</td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
