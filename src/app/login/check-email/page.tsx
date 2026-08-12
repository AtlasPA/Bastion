import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <div className="mx-auto max-w-sm space-y-3 py-12 text-center">
      <h1 className="font-display text-2xl font-bold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        A sign-in link is on its way. It expires in 24 hours — you can close
        this tab.
      </p>
    </div>
  );
}
