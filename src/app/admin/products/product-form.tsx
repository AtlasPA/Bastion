import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeTextarea,
} from "@/components/ui/native-select";
import { CONDITION_LABELS } from "@/lib/conditions";
import type { Category, Product } from "@/generated/prisma/client";

const STATUS_LABELS = {
  DRAFT: "Draft (hidden)",
  ACTIVE: "Active (for sale)",
  SOLD: "Sold",
  ARCHIVED: "Archived (hidden)",
} as const;

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  product?: Product;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="title">
          Title
        </label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={product?.title}
          placeholder="e.g. Pokemon Emerald (Game Boy Advance)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Category
          </label>
          <NativeSelect
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
          >
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="condition">
            Condition
          </label>
          <NativeSelect
            id="condition"
            name="condition"
            required
            defaultValue={product?.condition ?? "NM"}
          >
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="price">
            Price ($)
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={
              product ? (product.priceCents / 100).toFixed(2) : undefined
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="cost">
            Your cost ($)
          </label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="—"
            defaultValue={
              product?.costCents != null
                ? (product.costCents / 100).toFixed(2)
                : undefined
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="quantity">
            Quantity
          </label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.quantity ?? 1}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="status">
            Status
          </label>
          <NativeSelect
            id="status"
            name="status"
            required
            defaultValue={product?.status ?? "ACTIVE"}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <NativeTextarea
          id="description"
          name="description"
          defaultValue={product?.description}
          placeholder="Condition details, what's included, anything a buyer should know."
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="sku">
          SKU{" "}
          <span className="font-normal text-muted-foreground">
            (leave blank to auto-generate)
          </span>
        </label>
        <Input
          id="sku"
          name="sku"
          defaultValue={product?.sku}
          placeholder="BAS-0001"
        />
      </div>

      <Button type="submit">
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
