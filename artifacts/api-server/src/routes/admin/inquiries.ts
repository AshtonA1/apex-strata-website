import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import {
  db,
  adminsTable,
  inquiriesTable,
  inquiryRepliesTable,
  INQUIRY_STATUSES,
  type Admin,
  type Inquiry,
} from "@workspace/db";
import { fromError } from "zod-validation-error";
import { createLimiter } from "../../lib/rate-limit";
import { mailConfigured, sendMail } from "../../lib/mail";
import { requireOwner } from "../../middlewares/auth";

/** Public: the website's contact form. */
export const publicInquiryRouter: IRouter = Router();

const submitLimiter = createLimiter({
  keyPrefix: "inquiry",
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: "You've sent several messages already. Please try again later or email us directly.",
});

const submitSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120).transform((v) => v.replace(/\s+/g, " ")),
  company: z.string().trim().max(150).transform((v) => v.replace(/\s+/g, " ")).optional(),
  email: z.string().trim().max(254).pipe(z.email("Please enter a valid email")),
  message: z.string().trim().min(10, "Please write a few words about what you need").max(5000),
  // Honeypot: hidden from people, bots fill it in.
  website: z.string().max(500).optional(),
});

publicInquiryRouter.post("/inquiries", submitLimiter, async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: fromError(parsed.error).toString() });
    return;
  }
  const { website, ...data } = parsed.data;
  if (website) {
    res.status(201).json({ ok: true }); // pretend success so bots don't adapt
    return;
  }
  try {
    const [owner] = await db
      .select()
      .from(adminsTable)
      .where(and(eq(adminsTable.role, "owner"), eq(adminsTable.active, true)))
      .orderBy(adminsTable.id)
      .limit(1);
    const [row] = await db
      .insert(inquiriesTable)
      .values({ ...data, company: data.company || null, assignedAdminId: owner?.id ?? null })
      .returning();
    res.status(201).json({ ok: true });

    // Heads-up email to whoever owns the inbox. Best effort: the inquiry is already saved.
    if (owner && row && mailConfigured()) {
      void sendMail({
        to: owner.email,
        subject: `New website inquiry from ${data.name}`,
        text: `${data.name}${data.company ? ` (${data.company})` : ""} <${data.email}> sent an inquiry through the website.\n\nSign in to the admin portal to read and reply.`,
      });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to save inquiry");
    res.status(500).json({ error: "Something went wrong. Please email us directly." });
  }
});

/** Admin: mounted behind requireAdmin. */
const router: IRouter = Router();

const isOwner = (a: Admin) => a.role === "owner";
const canSee = (a: Admin, i: Inquiry) => isOwner(a) || i.assignedAdminId === a.id;

router.get("/", async (req, res) => {
  const admin = req.admin!;
  const status = typeof req.query["status"] === "string" ? req.query["status"] : "";
  const conds: SQL[] = [];
  // Owner sees every inbox, unless they ask for just their own with ?mine=1.
  if (!isOwner(admin) || req.query["mine"] === "1") conds.push(eq(inquiriesTable.assignedAdminId, admin.id));
  if ((INQUIRY_STATUSES as readonly string[]).includes(status)) {
    conds.push(eq(inquiriesTable.status, status as (typeof INQUIRY_STATUSES)[number]));
  } else {
    conds.push(sql`${inquiriesTable.status} <> 'archived'`);
  }
  const rows = await db
    .select({
      id: inquiriesTable.id,
      name: inquiriesTable.name,
      company: inquiriesTable.company,
      email: inquiriesTable.email,
      message: inquiriesTable.message,
      status: inquiriesTable.status,
      createdAt: inquiriesTable.createdAt,
      assignedAdminId: inquiriesTable.assignedAdminId,
      assignedName: adminsTable.name,
    })
    .from(inquiriesTable)
    .leftJoin(adminsTable, eq(adminsTable.id, inquiriesTable.assignedAdminId))
    .where(and(...conds))
    .orderBy(desc(inquiriesTable.createdAt))
    .limit(300);
  res.json(rows.map((r) => ({ ...r, message: r.message.slice(0, 160) })));
});

router.get("/unread-count", async (req, res) => {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(inquiriesTable)
    .where(and(eq(inquiriesTable.assignedAdminId, req.admin!.id), eq(inquiriesTable.status, "new")));
  res.json({ unread: r?.n ?? 0 });
});

async function loadInquiry(req: { params: Record<string, string | string[] | undefined> }, admin: Admin) {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) return null;
  const [row] = await db.select().from(inquiriesTable).where(eq(inquiriesTable.id, id)).limit(1);
  // A non-owner asking for someone else's inquiry gets the same answer as for one that doesn't exist.
  return row && canSee(admin, row) ? row : null;
}

router.get("/:id", async (req, res) => {
  const admin = req.admin!;
  let inquiry = await loadInquiry(req, admin);
  if (!inquiry) {
    res.status(404).json({ error: "Message not found." });
    return;
  }
  if (inquiry.status === "new" && inquiry.assignedAdminId === admin.id) {
    [inquiry] = await db
      .update(inquiriesTable)
      .set({ status: "read", readAt: new Date() })
      .where(eq(inquiriesTable.id, inquiry.id))
      .returning();
  }
  const replies = await db
    .select({
      id: inquiryRepliesTable.id,
      subject: inquiryRepliesTable.subject,
      body: inquiryRepliesTable.body,
      delivered: inquiryRepliesTable.delivered,
      error: inquiryRepliesTable.error,
      sentAt: inquiryRepliesTable.sentAt,
      adminName: adminsTable.name,
    })
    .from(inquiryRepliesTable)
    .leftJoin(adminsTable, eq(adminsTable.id, inquiryRepliesTable.adminId))
    .where(eq(inquiryRepliesTable.inquiryId, inquiry!.id))
    .orderBy(inquiryRepliesTable.sentAt);
  res.json({ inquiry, replies, emailConfigured: mailConfigured() });
});

const patchSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  assignedAdminId: z.number().int().positive().optional(),
});

router.patch("/:id", async (req, res) => {
  const admin = req.admin!;
  const parsed = patchSchema.safeParse(req.body);
  const inquiry = await loadInquiry(req, admin);
  if (!parsed.success || !inquiry) {
    res.status(inquiry ? 400 : 404).json({ error: inquiry ? "Invalid request." : "Message not found." });
    return;
  }
  const { status, assignedAdminId } = parsed.data;
  if (assignedAdminId !== undefined) {
    if (!isOwner(admin)) {
      res.status(403).json({ error: "Only the owner can reassign messages." });
      return;
    }
    const [target] = await db
      .select({ id: adminsTable.id })
      .from(adminsTable)
      .where(and(eq(adminsTable.id, assignedAdminId), eq(adminsTable.active, true)))
      .limit(1);
    if (!target) {
      res.status(400).json({ error: "That account doesn't exist or is deactivated." });
      return;
    }
  }
  const [row] = await db
    .update(inquiriesTable)
    .set({
      ...(status !== undefined && { status }),
      ...(assignedAdminId !== undefined && { assignedAdminId, ...(inquiry.assignedAdminId !== assignedAdminId && { status: "new" as const, readAt: null }) }),
    })
    .where(eq(inquiriesTable.id, inquiry.id))
    .returning();
  res.json(row);
});

const replySchema = z.object({
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1, "Write a reply first").max(10000),
});

router.post("/:id/reply", async (req, res) => {
  const admin = req.admin!;
  const parsed = replySchema.safeParse(req.body);
  const inquiry = await loadInquiry(req, admin);
  if (!parsed.success || !inquiry) {
    res.status(inquiry ? 400 : 404).json({ error: parsed.success ? "Message not found." : fromError(parsed.error).toString() });
    return;
  }
  const subject = parsed.data.subject || "Re: Your inquiry to Apex Strata Consulting";
  // No personal name anywhere in outgoing mail (client requirement): sign off as the company.
  const text = `${parsed.data.body}\n\n--\nApex Strata Consulting`;

  const result = await sendMail({
    to: inquiry.email,
    subject,
    text,
  });

  const [reply] = await db
    .insert(inquiryRepliesTable)
    .values({
      inquiryId: inquiry.id,
      adminId: admin.id,
      subject,
      body: parsed.data.body,
      delivered: result.ok,
      error: result.ok ? null : result.error,
    })
    .returning();

  if (!result.ok) {
    res.status(502).json({ error: result.error, reply });
    return;
  }
  await db.update(inquiriesTable).set({ status: "replied" }).where(eq(inquiriesTable.id, inquiry.id));
  res.status(201).json(reply);
});

router.delete("/:id", requireOwner, async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  await db.delete(inquiriesTable).where(inArray(inquiriesTable.id, [id]));
  res.json({ ok: true });
});

export default router;
