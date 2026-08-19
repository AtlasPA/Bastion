import { cn } from "@/lib/utils";

/** Marks proof-of-concept features so nothing reads as a live promise. */
export function PreviewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400",
        className
      )}
    >
      Preview
    </span>
  );
}

export function PreviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
      <span aria-hidden>🛠️</span>
      <p>{children}</p>
    </div>
  );
}
