import type { Condition } from "@/generated/prisma/client";

export const CONDITION_LABELS: Record<Condition, string> = {
  SEALED: "Sealed",
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};
