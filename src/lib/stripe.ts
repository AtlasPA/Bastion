import Stripe from "stripe";

// Server-side Stripe client. Key comes from the environment:
// test key locally / in preview, live key in production at launch.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});
