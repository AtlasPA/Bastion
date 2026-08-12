import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bastion — Games & Trading Cards",
    template: "%s | Bastion",
  },
  description:
    "Bastion buys and sells used videogames and trading cards. Browse the shop or send us an offer on your collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Bastion
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/products" className="hover:underline">
                Shop
              </Link>
              <Link
                href="/products?category=video-games"
                className="hover:underline"
              >
                Video Games
              </Link>
              <Link
                href="/products?category=trading-cards"
                className="hover:underline"
              >
                Trading Cards
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bastion. Used games and cards, graded
            honestly.
          </div>
        </footer>
      </body>
    </html>
  );
}
