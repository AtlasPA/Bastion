import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console Repair",
  description:
    "Console repair by collectors who fix their own inventory — cartridge slots, disc drives, HDMI ports, cleaning, and more. Describe the problem, get a quote, no work until you approve.",
  alternates: { canonical: "/repairs" },
};

export default function RepairsLayout({ children }: LayoutProps<"/repairs">) {
  return children;
}
