"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { offerSentEmail, sendEmail } from "@/lib/email";
import type { OfferStatus } from "@/generated/prisma/client";

function revalidate(id: string) {
  revalidatePath("/admin/offers");
  revalidatePath(`/admin/offers/${id}`);
}

export async function setOfferStatus(id: string, status: OfferStatus) {
  await requireAdmin();
  await db.offerSubmission.update({ where: { id }, data: { status } });
  revalidate(id);
}

export async function saveOfferNotes(id: string, formData: FormData) {
  await requireAdmin();
  const notes = z
    .string()
    .max(5000)
    .parse(formData.get("adminNotes") ?? "");
  await db.offerSubmission.update({
    where: { id },
    data: { adminNotes: notes },
  });
  revalidate(id);
}

export async function sendOffer(id: string, formData: FormData) {
  const session = await requireAdmin();
  const parsed = z
    .object({
      amount: z.coerce.number().positive("Offer must be more than $0"),
      message: z.string().trim().max(2000),
    })
    .safeParse({
      amount: formData.get("amount"),
      message: formData.get("message") ?? "",
    });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the offer." };
  }

  const offerCents = Math.round(parsed.data.amount * 100);
  const submission = await db.offerSubmission.update({
    where: { id },
    data: { offerCents, status: "OFFER_SENT" },
  });

  const email = offerSentEmail({
    name: submission.name,
    offerCents,
    message: parsed.data.message,
  });
  await sendEmail({
    to: submission.email,
    ...email,
    // Seller replies land in the owner's inbox, not the no-reply address.
    replyTo: session.user.email ?? undefined,
  });

  revalidate(id);
  return { ok: true as const };
}
