import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  providers: [
    Resend({
      from:
        process.env.EMAIL_FROM ??
        "Bastion GameVault <onboarding@resend.dev>",
      // Without an API key (local dev), print the sign-in link to the
      // server console instead of sending an email.
      ...(process.env.RESEND_API_KEY
        ? {}
        : {
            async sendVerificationRequest({ identifier, url }) {
              console.log(
                `\n[dev login] Magic link for ${identifier}:\n${url}\n`
              );
            },
          }),
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});

/** Server-side guard for admin pages and actions. Redirects non-admins. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
