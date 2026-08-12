import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategory,
  deleteCategory,
  renameCategory,
} from "./actions";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Categories</h1>

      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
          >
            <form
              action={renameCategory.bind(null, c.id)}
              className="flex flex-1 items-center gap-2"
            >
              <Input
                name="name"
                defaultValue={c.name}
                required
                className="h-8"
              />
              <Button type="submit" variant="secondary" size="sm">
                Rename
              </Button>
            </form>
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {c._count.products} item{c._count.products === 1 ? "" : "s"}
            </span>
            {c._count.products === 0 && (
              <form action={deleteCategory.bind(null, c.id)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  Delete
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>

      <form action={createCategory} className="flex items-center gap-2">
        <Input name="name" placeholder="New category name" required />
        <Button type="submit">Add</Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Categories with items can&apos;t be deleted — move the items first.
      </p>
    </div>
  );
}
