import type { Metadata } from "next";
import Link from "next/link";
import { Baloo_2, Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-context";
import { CartLink } from "@/components/cart/cart-link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Rounded display face matching the logo's letterforms.
const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold uppercase ${className}`}>
      <span className="text-brand-red">Bastion</span>{" "}
      <span className="text-brand-blue">GameVault</span>
    </span>
  );
}

export const metadata: Metadata = {
  title: {
    default: "Bastion GameVault — Games & Trading Cards",
    template: "%s | Bastion GameVault",
  },
  description:
    "Bastion GameVault buys and sells used videogames and trading cards. Browse the shop or send us an offer on your collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-xl tracking-tight">
              <Wordmark />
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link href="/products" className="hover:underline">
                Shop
              </Link>
              <Link
                href="/products?category=video-games"
                className="hidden hover:underline sm:inline"
              >
                Video Games
              </Link>
              <Link
                href="/products?category=trading-cards"
                className="hidden hover:underline sm:inline"
              >
                Trading Cards
              </Link>
              <Link href="/sell-to-us" className="hover:underline">
                Sell to Us
              </Link>
              <CartLink />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bastion GameVault. Buy, sell, and
            trade videogames and trading cards.
          </div>
        </footer>
        </CartProvider>
      </body>
    </html>
  );
}
