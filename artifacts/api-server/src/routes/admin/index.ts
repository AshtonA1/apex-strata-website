import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, projectsTable, inquiriesTable } from "@workspace/db";
import { mailConfigured } from "../../lib/mail";
import { blockUntilPasswordChanged, requireAdmin } from "../../middlewares/auth";
import authRouter from "./auth";
import adminsRouter from "./admins";
import projectsRouter from "./projects";
import inquiriesRouter from "./inquiries";

const router: IRouter = Router();

// /login, /logout, /me, /change-password handle their own auth checks.
router.use(authRouter);

// Everything below needs a signed-in admin who isn't being forced to change their password.
router.use(requireAdmin, blockUntilPasswordChanged);

router.get("/summary", async (req, res) => {
  const [p] = await db.select({ n: sql<number>`count(*)::int` }).from(projectsTable);
  const byStatus = await db
    .select({ status: projectsTable.status, n: sql<number>`count(*)::int` })
    .from(projectsTable)
    .groupBy(projectsTable.status);
  const [mine] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(inquiriesTable)
    .where(sql`${inquiriesTable.assignedAdminId} = ${req.admin!.id} and ${inquiriesTable.status} = 'new'`);
  res.json({
    projects: p?.n ?? 0,
    projectsByStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.n])),
    unreadInquiries: mine?.n ?? 0,
    emailConfigured: mailConfigured(),
  });
});

router.use("/admins", adminsRouter);
router.use("/projects", projectsRouter);
router.use("/inquiries", inquiriesRouter);

export default router;
