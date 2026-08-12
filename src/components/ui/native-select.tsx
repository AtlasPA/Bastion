import * as React from "react";
import { cn } from "@/lib/utils";

function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  );
}

function NativeTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  );
}

export { NativeSelect, NativeTextarea };
