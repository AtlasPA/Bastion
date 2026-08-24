import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bastion GameVault is a collector-run game and trading card shop based in Springfield, Missouri — selling retro games and cards, and buying collections with straight cash offers.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-8 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-6">
      <h1 className="font-display text-3xl font-bold">About Bastion GameVault</h1>

      <p>
        Bastion GameVault is a collector-run shop based in{" "}
        <strong>Springfield, Missouri</strong>. We buy and sell retro
        videogames and trading cards — the stuff we grew up hunting for
        ourselves: cartridge-era Nintendo, WOTC-era Pokemon, classic
        Yu-Gi-Oh! and Magic.
      </p>

      <h2>How we got here</h2>
      <p>
        We started the way most of this hobby does: trading at card shows and
        selling on marketplaces, where fees quietly eat 10–15% of every sale.
        Bastion GameVault is the storefront we always wanted — our own shelf,
        our own standards, no middleman between us and the people we deal
        with.
      </p>

      <h2>Our standards</h2>
      <p>
        We only buy and sell items in Lightly Played condition or better.
        Every listing shows the actual item or its official artwork, cards
        ship sleeved and protected, games ship padded, and if something ever
        arrives not as described, our{" "}
        <Link href="/returns" className="underline hover:no-underline">
          30-day return policy
        </Link>{" "}
        has your back.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions, offers, or just want to talk shop? Email{" "}
        <a
          href="mailto:bastiongamevault@gmail.com"
          className="underline hover:no-underline"
        >
          bastiongamevault@gmail.com
        </a>{" "}
        — a real person reads it, usually the same day.
      </p>

      <div className="pt-2">
        <Button render={<Link href="/sell-to-us" />}>
          Sell us your collection
        </Button>
      </div>
    </article>
  );
}
