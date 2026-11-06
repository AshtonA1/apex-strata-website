import { defineConfig } from "drizzle-kit";
import path from "path";
import { drizzleKitUrl } from "./src/connection";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    // Same TLS handling as the app (see src/connection.ts), so `db push` works against Supabase.
    url: drizzleKitUrl(process.env.DATABASE_URL),
  },
});
