import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Local prisma-dev server uses template1 as the app database; migrate's
    // shadow DB must live on the separate shadow server (port 51215) or it
    // gets created as a copy of template1 and collides with existing types.
    // Optional: unset in production (migrations there run via migrate deploy,
    // which needs no shadow database).
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
