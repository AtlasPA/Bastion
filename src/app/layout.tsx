import type { Metadata } from "next";
import Link from "next/link";
import { Baloo_2, Geist, Geist_Mono } from "next/font/google";
import { UserRound } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/components/cart/cart-context";
import { CartLink } from "@/components/cart/cart-link";
import { SettingsMenu } from "@/components/theme/settings-menu";
import "./globals.css";

// Applies the saved theme before first paint to avoid a flash of the
// wrong mode. Runs as an inline script at the top of <body>.
const themeInitScript = `(function(){try{var t=localStorage.getItem("bastion-theme");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

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


export const metadata: Metadata = {
  metadataBase: new URL("https://bastiongamevault.com"),
  title: {
    default: "Bastion GameVault — Games & Trading Cards",
    template: "%s | Bastion GameVault",
  },
  description:
    "Bastion GameVault buys and sells used videogames and trading cards. Browse the shop or send us an offer on your collection.",
  openGraph: {
    siteName: "Bastion GameVault",
    type: "website",
    images: [{ url: "/logo.jpg", width: 1200, height: 1200 }],
  },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <CartProvider>
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Bastion GameVault"
                width={100}
                height={45}
                className="h-9 w-auto sm:h-10"
              />
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
              <Link
                href="/account"
                aria-label="Your account"
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UserRound className="size-4" aria-hidden />
              </Link>
              <SettingsMenu />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Bastion GameVault. Buy, sell, and
              trade videogames and trading cards.
            </span>
            <nav className="flex gap-4 text-xs">
              <Link href="/returns" className="hover:underline">
                Returns
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <a
                href="mailto:bastiongamevault@gmail.com"
                className="hover:underline"
              >
                Contact
              </a>
            </nav>
          </div>
        </footer>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
