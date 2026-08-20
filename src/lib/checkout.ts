import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const FLAT_SHIPPING_CENTS = 499;

const cartItemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().min(1).max(10),
    })
  )
  .min(1, "Cart is empty")
  .max(50);

export type CheckoutResult =
  | { url: string }
  | { error: string };

/**
 * Validates cart items against the database (never trusting client prices),
 * creates a PENDING order with snapshots, and returns a Stripe hosted
 * Checkout Session URL. The order is marked PAID only by the webhook.
 */
export async function createCheckoutSession(
  rawItems: unknown
): Promise<CheckoutResult> {
  const parsed = cartItemsSchema.safeParse(rawItems);
  if (!parsed.success) return { error: "Your cart looks invalid — try again." };
  const requested = parsed.data;

  const products = await db.product.findMany({
    where: { id: { in: requested.map((i) => i.productId) } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const lines: {
    product: (typeof products)[number];
    quantity: number;
  }[] = [];
  for (const item of requested) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.status !== "ACTIVE") {
      return {
        error: `Sorry — an item in your cart is no longer available.`,
      };
    }
    if (product.quantity < item.quantity) {
      return {
        error: `Sorry — "${product.title}" just sold out. Remove it from your cart to continue.`,
      };
    }
    lines.push({ product, quantity: item.quantity });
  }

  const subtotalCents = lines.reduce(
    (n, l) => n + l.product.priceCents * l.quantity,
    0
  );

  const order = await db.order.create({
    data: {
      email: "",
      status: "PENDING",
      // Placeholder until the Stripe session exists (column is unique).
      stripeSessionId: `pending_${crypto.randomUUID()}`,
      subtotalCents,
      shippingCents: FLAT_SHIPPING_CENTS,
      totalCents: subtotalCents + FLAT_SHIPPING_CENTS,
      items: {
        create: lines.map((l) => ({
          productId: l.product.id,
          titleSnapshot: l.product.title,
          conditionSnapshot: l.product.condition,
          priceCentsSnapshot: l.product.priceCents,
          quantity: l.quantity,
        })),
      },
    },
  });

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: l.product.priceCents,
        product_data: {
          name: l.product.title,
          ...(l.product.images[0]?.url.startsWith("https://")
            ? { images: [l.product.images[0].url] }
            : {}),
        },
      },
    })),
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: "Standard shipping",
          fixed_amount: { amount: FLAT_SHIPPING_CENTS, currency: "usd" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
    ],
    ...(process.env.STRIPE_TAX_ENABLED === "1"
      ? { automatic_tax: { enabled: true } }
      : {}),
    metadata: { orderId: order.id },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  if (!session.url) return { error: "Stripe didn't return a checkout page." };
  return { url: session.url };
}
