import { Router, type IRouter } from "express";
import { randomInt } from "node:crypto";
import { z } from "zod/v4";
import { and, eq, ne, sql } from "drizzle-orm";
import { db, adminsTable, inquiriesTable, ADMIN_ROLES } from "@workspace/db";
import { fromError } from "zod-validation-error";
import { checkPasswordStrength, hashPassword } from "../../lib/password";
import { destroyAdminSessions } from "../../lib/session";
import { requireOwner } from "../../middlewares/auth";

const router: IRouter = Router();
router.use(requireOwner);

// No look-alike characters (0/O, 1/l/I) so it can be read out over WhatsApp without mistakes.
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generatePassword(len = 16) {
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

const listShape = {
  id: adminsTable.id,
  email: adminsTable.email,
  name: adminsTable.name,
  role: adminsTable.role,
  active: adminsTable.active,
  mustChangePassword: adminsTable.mustChangePassword,
  lastLoginAt: adminsTable.lastLoginAt,
  createdAt: adminsTable.createdAt,
};

router.get("/", async (_req, res) => {
  const rows = await db.select(listShape).from(adminsTable).orderBy(adminsTable.id);
  res.json(rows);
});

const createSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  name: z.string().trim().min(1).max(120),
  role: z.enum(ADMIN_ROLES).default("admin"),
  // Optional. If omitted a strong temporary password is generated and returned once.
  password: z.string().max(200).optional(),
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: fromError(parsed.error).toString() });
    return;
  }
  const { email, name, role } = parsed.data;
  const password = parsed.data.password || generatePassword();
  const weak = checkPasswordStrength(password, email);
  if (weak) {
    res.status(400).json({ error: weak });
    return;
  }
  const [existing] = await db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }
  const [row] = await db
    .insert(adminsTable)
    .values({ email, name, role, passwordHash: await hashPassword(password), mustChangePassword: true })
    .returning(listShape);
  req.log.info({ by: req.admin!.id, newAdminId: row!.id }, "Admin account created");
  // The temporary password is shown once and never stored in readable form.
  res.status(201).json({ admin: row, temporaryPassword: password });
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(ADMIN_ROLES).optional(),
  active: z.boolean().optional(),
});

async function activeOwnerCountExcluding(id: number) {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(adminsTable)
    .where(and(eq(adminsTable.role, "owner"), eq(adminsTable.active, true), ne(adminsTable.id, id)));
  return r?.n ?? 0;
}

router.patch("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const parsed = updateSchema.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  const [target] = await db.select().from(adminsTable).where(eq(adminsTable.id, id)).limit(1);
  if (!target) {
    res.status(404).json({ error: "Account not found." });
    return;
  }
  const { name, role, active } = parsed.data;
  const self = id === req.admin!.id;
  if (self && (role !== undefined && role !== target.role || active === false)) {
    res.status(400).json({ error: "You can't change your own role or deactivate yourself." });
    return;
  }
  const losingOwner = target.role === "owner" && target.active && (role === "admin" || active === false);
  if (losingOwner && (await activeOwnerCountExcluding(id)) < 1) {
    res.status(400).json({ error: "There must always be at least one active owner." });
    return;
  }
  const [row] = await db
    .update(adminsTable)
    .set({ ...(name !== undefined && { name }), ...(role !== undefined && { role }), ...(active !== undefined && { active }) })
    .where(eq(adminsTable.id, id))
    .returning(listShape);
  if (active === false) {
    await destroyAdminSessions(id);
    // Their inbox moves to the owner who deactivated them so nothing is orphaned.
    await db.update(inquiriesTable).set({ assignedAdminId: req.admin!.id }).where(eq(inquiriesTable.assignedAdminId, id));
  }
  res.json(row);
});

router.post("/:id/reset-password", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  const password = generatePassword();
  const [row] = await db
    .update(adminsTable)
    .set({ passwordHash: await hashPassword(password), mustChangePassword: true, failedAttempts: 0, lockedUntil: null })
    .where(eq(adminsTable.id, id))
    .returning({ id: adminsTable.id });
  if (!row) {
    res.status(404).json({ error: "Account not found." });
    return;
  }
  await destroyAdminSessions(id);
  req.log.info({ by: req.admin!.id, adminId: id }, "Admin password reset");
  res.json({ temporaryPassword: password });
});

export default router;
