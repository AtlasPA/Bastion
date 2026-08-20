import { repriceAll } from "@/lib/pricing/engine";

// Daily auto-pricing run, triggered by Vercel Cron (see vercel.json).
// Vercel sends "Authorization: Bearer <CRON_SECRET>" automatically.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const counts = await repriceAll();
  return Response.json(counts);
}

export const maxDuration = 300;
