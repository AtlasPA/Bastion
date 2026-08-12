<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bastion

E-commerce site for a small resale business: used videogames and trading cards. Owner is non-technical — keep code boring, mainstream, and readable; "simplicity is key" is a written requirement. Original requirements: `docs/design requirements.md`. Full phased roadmap: `C:\Users\sdysa\.claude\plans\precious-inventing-quilt.md` (V1 = online store; POS deferred to V2).

## Stack
Next.js (App Router, TS, `src/`) · Prisma 7 + Postgres · Tailwind v4 + shadcn/ui (Base UI — buttons use `render={<Link/>}`, not `asChild`) · Zod. Planned integrations: Auth.js (magic link + Google), Stripe hosted Checkout + Stripe Tax, Shippo, Resend, Vercel Blob, PriceCharting API.

## Conventions
- Money is always integer cents (`priceCents`); format with `formatCents` in `src/lib/format.ts`.
- Prisma client singleton: `db` from `src/lib/db.ts` (uses `@prisma/adapter-pg`); generated client is at `src/generated/prisma` (gitignored, rebuilt by `postinstall`).
- Orders become PAID and stock decrements only in the Stripe webhook — never on the success redirect.
- PriceCharting suggested prices are cached on Product (`pcLooseCents` etc.) but never auto-applied to `priceCents`.
- Condition grading enum (SEALED/NM/LP/MP/HP/DMG) is shared by games and cards; labels in `src/lib/conditions.ts`.

## Local dev
- `npm run db:up` — start local Prisma Postgres (detached; DATABASE_URL in `.env` points at it)
- `npm run dev` — dev server
- `npm run db:migrate` / `db:seed` / `db:studio`
- Production DB will be Neon; deploy target Vercel (not yet set up).
