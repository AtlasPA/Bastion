"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession } from "@/lib/checkout";

export async function beginCheckout(
  items: { productId: string; quantity: number }[]
) {
  const result = await createCheckoutSession(items);
  if ("error" in result) return { error: result.error };
  redirect(result.url);
}
