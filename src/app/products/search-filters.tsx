"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/generated/prisma/client";

export function SearchFilters({
  categories,
  q,
  category,
}: {
  categories: Category[];
  q: string;
  category: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(nextQ: string, nextCategory: string) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCategory) params.set("category", nextCategory);
    router.push(params.size ? `${pathname}?${params}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q");
          navigate(typeof value === "string" ? value.trim() : "", category);
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
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={category === "" ? "default" : "outline"}
          onClick={() => navigate(q, "")}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={category === c.slug ? "default" : "outline"}
            onClick={() => navigate(q, c.slug)}
          >
            {c.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
