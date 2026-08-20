# Bastion GameVault — Owner's Runbook

The store lives at **https://bastiongamevault.com**. This file is the "how do I…" reference for running it.

## Daily operations (no code involved)

- **Add a product**: bastiongamevault.com/admin → Products → Add product. Set condition honestly, add photos after saving. Set "Your cost" if you want auto-pricing.
- **Auto-price a card**: on the product's edit page → Market pricing → search the card → click the exact printing/variant → turn Auto-pricing ON. Requires "Your cost" (the 25% profit floor is computed from it). Big market moves wait in Admin → Pricing for your approval.
- **Fulfill an order**: Admin → Orders → open it → enter package weight/size → "Buy cheapest label & mark shipped". Print the label PDF. The customer gets tracking automatically.
- **Refund**: Stripe dashboard → find the payment → Refund. Then Admin → order → "Mark refunded". Stock is NOT restored automatically — re-activate the product manually if you're relisting it.
- **Respond to a sell-to-us offer**: Admin → Offers → open → "Email offer". Replies land in your own inbox.
- **Approve reviews**: Admin → Reviews.

## Accounts that power the site

| Service | What it does | Login |
|---|---|---|
| Vercel | Hosting + product photo storage + daily repricing cron | GitHub login (AtlasPA) |
| Neon | The database | GitHub login |
| GitHub | The code (AtlasPA/Bastion) | — |
| Stripe | Payments ("Bastion GameVault" account, NOT the Misprint one) | bastiongamevault@gmail.com |
| SendGrid | All email (sign-in links, receipts, tracking, offers) | — |
| Shippo | Shipping labels | — |
| Wix | Domain registration + DNS records only | — |

## Go-live checklist (test mode → real money)

1. Stripe: complete business activation (bank account, tax ID), switch dashboard out of test mode, copy the LIVE secret key.
2. Stripe: Settings → Tax → add business address and register where required, so tax collects automatically.
3. Shippo: replace the test API token with a live one; confirm ship-from address and a real phone number.
4. Vercel: upgrade to Pro ($20/mo) — the free tier does not permit commercial use.
5. Hand the new keys to Claude (or update them in Vercel → Project → Settings → Environment Variables): `STRIPE_SECRET_KEY`, a NEW live webhook + `STRIPE_WEBHOOK_SECRET`, `SHIPPO_API_TOKEN`, `SHIP_FROM_*`, and set `STRIPE_TAX_ENABLED=1`.
6. Make one real small purchase end to end, then refund it.

## For developers / AI assistants

- Stack and conventions: see `AGENTS.md`. Local dev: `npm run db:up` then `npm run dev`.
- `.env` holds local secrets (never committed); production env vars live in Vercel.
- Deploys: push to `main` auto-deploys, or `npx vercel --prod`.
- The local dev database sometimes dies silently — `npm run db:up` restarts it ("Server has closed the connection" usually means exactly this).
- `npm audit` currently flags Prisma's config tooling (dev-only, not customer-facing); clears when Prisma ships an update — `npm update prisma @prisma/client` occasionally.
- Backups: Neon keeps ~24h point-in-time restore on the free tier. For belt-and-suspenders, occasionally run a `pg_dump` against the Neon URL and stash the file.

## Known deferred items

- **PriceCharting** (videogame + graded slab pricing): subscribe to Legendary ($59/yr), then have the API wired as the 4th pricing source.
- **Domain transfer**: after ~Oct 18, 2026 the domain can move from Wix to Vercel (auth code already obtained) — consolidates DNS management.
- **POS (in-person sales)**: planned V2 via Stripe Terminal.
