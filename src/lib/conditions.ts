import type { Condition } from "@/generated/prisma/client";

export const CONDITION_LABELS: Record<Condition, string> = {
  SEALED: "Sealed",
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};

// Color-coded badge styling: green (best) through red (worst).
export const CONDITION_BADGE_CLASSES: Record<Condition, string> = {
  SEALED:
    "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  NM: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  LP: "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300",
  MP: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  HP: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  DMG: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};
