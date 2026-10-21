import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db, adminsTable, type Admin } from "@workspace/db";
import { fromError } from "zod-validation-error";
import { checkPasswordStrength, getDummyHash, hashPassword, verifyPassword } from "../../lib/password";
import { createLimiter } from "../../lib/rate-limit";
import { createSession, destroyAdminSessions, destroySession } from "../../lib/session";
import { requireAdmin } from "../../middlewares/auth";

const router: IRouter = Router();

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
const GENERIC_FAIL = "Invalid email or password. After 5 failed attempts an account is locked for 15 minutes.";

export function publicAdmin(a: Admin) {
  return { id: a.id, email: a.email, name: a.name, role: a.role, mustChangePassword: a.mustChangePassword };
}

const loginLimiter = createLimiter({
  keyPrefix: "login",
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many sign-in attempts from this network. Try again in a few minutes.",
});
const passwordLimiter = createLimiter({
  keyPrefix: "pwchange",
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Try again in a few minutes.",
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().min(1).max(200),
});

router.post("/login", loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter your email and password." });
    return;
  }
  const { email, password } = parsed.data;
  const now = new Date();

  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, email)).limit(1);

  // Always do one scrypt comparison, whether or not the account exists, so timing is the same.
  const hashToCheck = admin?.passwordHash ?? (await getDummyHash());
  const passwordOk = await verifyPassword(password, hashToCheck);
  const locked = Boolean(admin?.lockedUntil && admin.lockedUntil > now);

  if (!admin || !admin.active || locked || !passwordOk) {
    if (admin && admin.active && !locked) {
      const attempts = admin.failedAttempts + 1;
      await db
        .update(adminsTable)
        .set(
          attempts >= MAX_FAILED
            ? { failedAttempts: 0, lockedUntil: new Date(now.getTime() + LOCK_MS) }
            : { failedAttempts: attempts },
        )
        .where(eq(adminsTable.id, admin.id));
      if (attempts >= MAX_FAILED) req.log.warn({ adminId: admin.id }, "Admin account locked after failed logins");
    }
    // Same status and message for every failure so the response doesn't reveal which part was wrong.
    res.status(401).json({ error: GENERIC_FAIL });
    return;
  }

  await db
    .update(adminsTable)
    .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: now })
    .where(eq(adminsTable.id, admin.id));
  await destroySession(req, res); // drop any stale session cookie from this browser
  const csrfToken = await createSession(req, res, admin.id);
  req.log.info({ adminId: admin.id }, "Admin signed in");
  res.json({ admin: publicAdmin(admin), csrfToken });
});

router.post("/logout", async (req, res) => {
  await destroySession(req, res);
  res.json({ ok: true });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: publicAdmin(req.admin!), csrfToken: req.csrfToken });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().max(200),
});

router.post("/change-password", requireAdmin, passwordLimiter, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: fromError(parsed.error).toString() });
    return;
  }
  const admin = req.admin!;
  const { currentPassword, newPassword } = parsed.data;
  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    res.status(400).json({ error: "Your current password is incorrect." });
    return;
  }
  const weak = checkPasswordStrength(newPassword, admin.email);
  if (weak) {
    res.status(400).json({ error: weak });
    return;
  }
  if (newPassword === currentPassword) {
    res.status(400).json({ error: "Choose a password different from the current one." });
    return;
  }
  await db
    .update(adminsTable)
    .set({ passwordHash: await hashPassword(newPassword), mustChangePassword: false })
    .where(eq(adminsTable.id, admin.id));
  // Sign out every other device; keep this one.
  await destroyAdminSessions(admin.id, req.sessionHash);
  res.json({ ok: true });
});

export default router;
