import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import {
  newOrderAlertEmail,
  orderConfirmationEmail,
  sendEmail,
} from "@/lib/email";

// Payment truth lives here: orders become PAID and stock decrements ONLY in
// this webhook — never on the success-page redirect.
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object;
    const order = await db.order.findUnique({
      where: { stripeSessionId: session.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return new Response("Unknown order", { status: 200 });

    if (event.type === "checkout.session.expired") {
      if (order.status === "PENDING") {
        await db.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });
      }
      return new Response("ok", { status: 200 });
    }

    // checkout.session.completed — idempotent: only act on PENDING orders.
    if (order.status !== "PENDING") return new Response("ok", { status: 200 });

    const address = session.customer_details?.address;
    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        // Guarded decrement: only decrements when enough stock remains.
        // If two buyers raced for the same copy, count === 0 here; the
        // product still flips to SOLD below and the owner refunds the
        // second payment from the Stripe dashboard.
        await tx.product.updateMany({
          where: { id: item.productId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });
        await tx.product.updateMany({
          where: { id: item.productId, quantity: { lte: 0 } },
          data: { status: "SOLD", quantity: 0 },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          email: session.customer_details?.email ?? "",
          taxCents: session.total_details?.amount_tax ?? 0,
          totalCents: session.amount_total ?? order.totalCents,
          shippingName: session.customer_details?.name ?? null,
          shippingStreet1: address?.line1 ?? null,
          shippingStreet2: address?.line2 ?? null,
          shippingCity: address?.city ?? null,
          shippingState: address?.state ?? null,
          shippingZip: address?.postal_code ?? null,
          shippingCountry: address?.country ?? "US",
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/products");
    for (const item of order.items) {
      revalidatePath(`/products/${item.product.slug}`);
    }

    // Confirmation to the buyer + alert to the owners. Failures are logged
    // inside sendEmail and never fail the webhook.
    const paid = await db.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (paid) {
      if (paid.email) {
        const confirmation = orderConfirmationEmail(paid);
        await sendEmail({ to: paid.email, ...confirmation });
      }
      const admins = await db.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      const alert = newOrderAlertEmail(paid);
      await sendEmail({ to: admins.map((a) => a.email), ...alert });
    }
  }

  return new Response("ok", { status: 200 });
}
