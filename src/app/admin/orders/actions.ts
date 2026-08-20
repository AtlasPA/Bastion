"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { buyCheapestLabel, shippoConfigured } from "@/lib/shippo";
import { sendEmail, shippedEmail } from "@/lib/email";

async function markShipped(
  orderId: string,
  data: {
    carrier: string | null;
    trackingNumber: string;
    labelUrl?: string | null;
    shippoTransactionId?: string | null;
  }
) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { status: "SHIPPED", ...data },
    include: { items: true },
  });
  if (order.email) {
    const email = shippedEmail(order, data.carrier, data.trackingNumber);
    await sendEmail({ to: order.email, ...email });
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function buyLabel(orderId: string, formData: FormData) {
  await requireAdmin();
  if (!shippoConfigured()) return { error: "Shippo isn't connected yet." };

  const parcel = z
    .object({
      weightOz: z.coerce.number().positive(),
      lengthIn: z.coerce.number().positive(),
      widthIn: z.coerce.number().positive(),
      heightIn: z.coerce.number().positive(),
    })
    .safeParse({
      weightOz: formData.get("weightOz"),
      lengthIn: formData.get("lengthIn"),
      widthIn: formData.get("widthIn"),
      heightIn: formData.get("heightIn"),
    });
  if (!parcel.success) return { error: "Enter valid package dimensions." };

  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.status !== "PAID") return { error: "Order isn't in PAID status." };
  if (!order.shippingStreet1 || !order.shippingCity || !order.shippingState || !order.shippingZip) {
    return { error: "Order is missing a shipping address." };
  }

  try {
    const label = await buyCheapestLabel({
      name: order.shippingName ?? "Customer",
      street1: order.shippingStreet1,
      street2: order.shippingStreet2,
      city: order.shippingCity,
      state: order.shippingState,
      zip: order.shippingZip,
      ...parcel.data,
    });
    await markShipped(orderId, {
      carrier: label.carrier,
      trackingNumber: label.trackingNumber,
      labelUrl: label.labelUrl,
      shippoTransactionId: label.transactionId,
    });
    return { ok: true as const };
  } catch (e) {
    console.error("Label purchase failed:", e);
    return {
      error:
        "Label purchase failed — you can buy it manually in the Shippo dashboard and enter tracking below.",
    };
  }
}

export async function addTracking(orderId: string, formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      carrier: z.string().trim().max(60),
      trackingNumber: z.string().trim().min(4).max(60),
    })
    .safeParse({
      carrier: formData.get("carrier") ?? "",
      trackingNumber: formData.get("trackingNumber"),
    });
  if (!parsed.success) return { error: "Enter a valid tracking number." };

  await markShipped(orderId, {
    carrier: parsed.data.carrier || null,
    trackingNumber: parsed.data.trackingNumber,
  });
  return { ok: true as const };
}

export async function setOrderStatus(
  orderId: string,
  status: "REFUNDED" | "CANCELLED"
) {
  await requireAdmin();
  await db.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
