import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  async function sendLink(formData: FormData) {
    "use server";
    await signIn("resend", formData);
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a sign-in link. No password
          needed.
        </p>
      </div>
      <form action={sendLink} className="space-y-3">
        <Input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <input type="hidden" name="redirectTo" value="/admin" />
        <Button type="submit" className="w-full">
          Email me a sign-in link
        </Button>
      </form>
    </div>
  );
}
