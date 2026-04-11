import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer DIRECT_URL for Migrate. Use pooled DATABASE_URL at runtime via the driver adapter.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
