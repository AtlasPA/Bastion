import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-20 text-center">
      <p className="font-display text-6xl font-bold text-brand-blue">404</p>
      <h1 className="font-display text-2xl font-bold">
        This one&apos;s not in the vault.
      </h1>
      <p className="text-muted-foreground">
        The page you&apos;re after doesn&apos;t exist — maybe it sold, maybe
        the link is old.
      </p>
      <Button render={<Link href="/products" />}>Browse the shop</Button>
    </div>
  );
}
