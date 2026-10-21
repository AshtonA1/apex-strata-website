import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { db, sessionsTable, adminsTable, type Admin } from "@workspace/db";
import { eq, lt } from "drizzle-orm";

export const COOKIE_NAME = "as_session";
const ABSOLUTE_TTL_MS = 12 * 60 * 60 * 1000; // hard stop 12h after login
const IDLE_TTL_MS = 2 * 60 * 60 * 1000; // sign out after 2h of no activity

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

function cookieOptions(req: Request) {
  return {
    httpOnly: true, // JavaScript can't read it, so XSS can't steal it
    secure: req.secure || process.env["NODE_ENV"] === "production",
    sameSite: "strict" as const, // not sent on cross-site requests
    path: "/api",
    maxAge: ABSOLUTE_TTL_MS,
  };
}

export async function createSession(req: Request, res: Response, adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(24).toString("base64url");
  const now = Date.now();
  await db.insert(sessionsTable).values({
    tokenHash: sha256(token),
    adminId,
    csrfToken,
    ip: req.ip ?? null,
    userAgent: (req.get("user-agent") ?? "").slice(0, 300) || null,
    expiresAt: new Date(now + ABSOLUTE_TTL_MS),
  });
  res.cookie(COOKIE_NAME, token, cookieOptions(req));
  return csrfToken;
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token === "string") {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, sha256(token)));
  }
  const { maxAge: _maxAge, ...clearOpts } = cookieOptions(req);
  res.clearCookie(COOKIE_NAME, clearOpts);
}

/** Deletes every session of an admin, optionally keeping the current one. */
export async function destroyAdminSessions(adminId: number, keepTokenHash?: string) {
  const rows = await db.select({ h: sessionsTable.tokenHash }).from(sessionsTable).where(eq(sessionsTable.adminId, adminId));
  for (const r of rows) {
    if (r.h !== keepTokenHash) await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, r.h));
  }
}

export type LoadedSession = { admin: Admin; csrfToken: string; tokenHash: string };

/** Looks up the session for the request cookie; null if missing, expired, idle or the admin is disabled. */
export async function loadSession(req: Request): Promise<LoadedSession | null> {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token !== "string" || token.length < 20 || token.length > 200) return null;
  const tokenHash = sha256(token);
  const [row] = await db
    .select({ session: sessionsTable, admin: adminsTable })
    .from(sessionsTable)
    .innerJoin(adminsTable, eq(adminsTable.id, sessionsTable.adminId))
    .where(eq(sessionsTable.tokenHash, tokenHash))
    .limit(1);
  if (!row) return null;
  const now = Date.now();
  const expired = row.session.expiresAt.getTime() <= now;
  const idle = row.session.lastSeenAt.getTime() + IDLE_TTL_MS <= now;
  if (expired || idle || !row.admin.active) {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, tokenHash));
    return null;
  }
  // Only write last_seen when it's meaningfully stale, to avoid a DB write on every request.
  if (now - row.session.lastSeenAt.getTime() > 60_000) {
    await db.update(sessionsTable).set({ lastSeenAt: new Date(now) }).where(eq(sessionsTable.tokenHash, tokenHash));
  }
  return { admin: row.admin, csrfToken: row.session.csrfToken, tokenHash };
}

export async function purgeExpiredSessions() {
  await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date()));
}

