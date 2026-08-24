import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Games & Cards",
  description:
    "Sell your videogames, Pokemon, Magic, and Yu-Gi-Oh! cards to Bastion GameVault. Send photos, get a real cash offer — no listing fees, no meetups, no waiting for a buyer.",
  alternates: { canonical: "/sell-to-us" },
};

export default function SellToUsLayout({
  children,
}: LayoutProps<"/sell-to-us">) {
  return children;
}
