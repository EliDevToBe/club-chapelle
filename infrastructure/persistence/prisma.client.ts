import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "~~/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set DATABASE_URL.");
}

const pool = new pg.Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 10_000,
});
const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });
