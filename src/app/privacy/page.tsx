import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="prose-sm mx-auto max-w-2xl space-y-4 py-8 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-6">
      <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: August 2026</p>

      <h2>What we collect</h2>
      <p>
        When you buy from us: your name, email, and shipping address — the
        minimum needed to get your order to you. When you sell to us: your
        name, email, and the photos and descriptions you submit. If you create
        an account, we store your email so you can sign in (we never see or
        store passwords — sign-in links are emailed instead).
      </p>

      <h2>Payments</h2>
      <p>
        Card payments are processed entirely by Stripe. Your card number never
        touches our servers. See Stripe&apos;s privacy policy at
        stripe.com/privacy.
      </p>

      <h2>Who we share data with</h2>
      <p>
        Only the services that make the store work: Stripe (payments), Shippo
        (shipping labels — they receive your shipping address), SendGrid
        (transactional email like receipts and tracking), and Vercel/Neon (our
        hosting and database). We don&apos;t sell or rent your information to
        anyone, ever.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a session cookie to keep you signed in and your browser&apos;s
        local storage to remember your cart. No third-party advertising
        trackers.
      </p>

      <h2>Your choices</h2>
      <p>
        Want your account or data deleted? Email us at
        bastiongamevault@gmail.com and we&apos;ll take care of it. We keep
        order records as long as required for taxes and accounting.
      </p>
    </article>
  );
}
