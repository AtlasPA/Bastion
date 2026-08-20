"use server";

import { put } from "@vercel/blob";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  offerAlertEmail,
  offerReceivedEmail,
  sendEmail,
} from "@/lib/email";

const offerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  description: z.string().trim().min(10, "Tell us a bit more").max(5000),
  askingPrice: z.string().trim(),
});

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export async function submitOffer(formData: FormData) {
  const parsed = offerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    description: formData.get("description"),
    askingPrice: formData.get("askingPrice") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const data = parsed.data;

  const askingPriceCents = data.askingPrice
    ? Math.round(Number(data.askingPrice) * 100)
    : null;
  if (askingPriceCents !== null && !(askingPriceCents >= 0)) {
    return { error: "Asking price must be a number." };
  }

  const photos = formData
    .getAll("photos")
    .filter(
      (f): f is File =>
        f instanceof File && f.size > 0 && f.type.startsWith("image/")
    )
    .slice(0, MAX_PHOTOS);
  if (photos.length === 0) {
    return { error: "Add at least one photo so we can make a fair offer." };
  }
  if (photos.some((p) => p.size > MAX_PHOTO_BYTES)) {
    return { error: "One of the photos is too large — try re-taking it." };
  }

  const session = await auth();

  const submission = await db.offerSubmission.create({
    data: {
      userId: session?.user?.id ?? null,
      name: data.name,
      email: data.email,
      description: data.description,
      askingPriceCents,
    },
  });

  for (const photo of photos) {
    const blob = await put(`offers/${submission.id}/${photo.name}`, photo, {
      access: "public",
      addRandomSuffix: true,
    });
    await db.offerPhoto.create({
      data: { offerSubmissionId: submission.id, url: blob.url },
    });
  }

  const received = offerReceivedEmail(data.name);
  await sendEmail({ to: data.email, ...received });

  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  const alert = offerAlertEmail({
    id: submission.id,
    name: data.name,
    email: data.email,
    description: data.description,
    askingPriceCents,
    photoCount: photos.length,
  });
  await sendEmail({ to: admins.map((a) => a.email), ...alert });

  return { ok: true as const };
}
