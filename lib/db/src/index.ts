import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { connectionSettings } from "./connection";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  ...connectionSettings(process.env.DATABASE_URL),
  // Supabase's session pooler allows a limited number of connections; a small pool is plenty here.
  max: Number(process.env.DB_POOL_MAX ?? 5),
});
export const db = drizzle(pool, { schema });

export * from "./schema";
