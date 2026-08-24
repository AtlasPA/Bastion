import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Card & Game Selling Fees Calculator",
  description:
    "What do you actually keep after fees selling cards and games on eBay, TCGplayer, and Mercari? Enter a price and see the real payout math — then compare a direct cash offer.",
  alternates: { canonical: "/payout-calculator" },
};

export default function PayoutCalculatorLayout({
  children,
}: LayoutProps<"/payout-calculator">) {
  return children;
}
