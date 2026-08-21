"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/checkout";

export async function beginCheckout(
  items: { productId: string; quantity: number }[]
) {
  const session = await auth();
  const result = await createCheckoutSession(items, session?.user?.id);
  if ("error" in result) return { error: result.error };
  redirect(result.url);
}
