"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { Category } from "@/generated/prisma/client";

export function SearchFilters({
  categories,
  q,
  category,
  sort,
}: {
  categories: Category[];
  q: string;
  category: string;
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(nextQ: string, nextCategory: string, nextSort: string) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCategory) params.set("category", nextCategory);
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
    router.push(params.size ? `${pathname}?${params}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q");
          navigate(
            typeof value === "string" ? value.trim() : "",
            category,
            sort
          );
        }}
      >
        <Input
          type="search"
          name="q"
          placeholder="Search games and cards…"
          defaultValue={q}
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={category === "" ? "default" : "outline"}
          onClick={() => navigate(q, "", sort)}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={category === c.slug ? "default" : "outline"}
            onClick={() => navigate(q, c.slug, sort)}
          >
            {c.name}
          </Button>
        ))}
        <NativeSelect
          value={sort}
          onChange={(e) => navigate(q, category, e.target.value)}
          className="h-7 w-36 text-[0.8rem]"
          aria-label="Sort products"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="title">Name A–Z</option>
        </NativeSelect>
      </div>
    </div>
  );
}
