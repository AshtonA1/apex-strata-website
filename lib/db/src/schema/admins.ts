import { pgTable, text, serial, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

export const ADMIN_ROLES = ["owner", "admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const adminsTable = pgTable("admins", {
  id: serial("id").primaryKey(),
  // Always stored lower-cased and trimmed.
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").$type<AdminRole>().notNull().default("admin"),
  // scrypt$N$r$p$salt$hash (see api-server/src/lib/password.ts). Never returned by the API.
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").default(true).notNull(),
  // Set when an owner creates/resets an account, cleared when the person picks their own password.
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
  failedAttempts: integer("failed_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable(
  "admin_sessions",
  {
    // sha256 of the random cookie token. The raw token only ever lives in the browser cookie.
    tokenHash: text("token_hash").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => adminsTable.id, { onDelete: "cascade" }),
    csrfToken: text("csrf_token").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => [index("admin_sessions_admin_idx").on(t.adminId)],
);

export type Admin = typeof adminsTable.$inferSelect;
export type AdminSession = typeof sessionsTable.$inferSelect;
