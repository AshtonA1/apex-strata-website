import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { asc, eq, sql } from "drizzle-orm";
import { db, projectsTable, PROJECT_STATUSES, type Project } from "@workspace/db";
import { fromError } from "zod-validation-error";

export function toPublicProject(p: Project) {
  return {
    id: p.id,
    title: p.title,
    client: p.client,
    clients: p.clients,
    location: p.location,
    status: p.status,
    desc: p.description,
  };
}

const ordered = [asc(projectsTable.sortOrder), asc(projectsTable.id)] as const;

/** Public: what the website shows. */
export const publicProjectsRouter: IRouter = Router();
publicProjectsRouter.get("/projects", async (req, res) => {
  try {
    const rows = await db.select().from(projectsTable).orderBy(...ordered);
    res.json(rows.map(toPublicProject));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

/** Admin: mounted behind requireAdmin. */
const router: IRouter = Router();

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  client: z.string().trim().min(1, "Client line is required").max(200),
  clients: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
  location: z.string().trim().min(1, "Location is required").max(200),
  status: z.enum(PROJECT_STATUSES),
  description: z.string().trim().min(1, "Description is required").max(3000),
});

const toAdminProject = (p: Project) => ({ ...toPublicProject(p), sortOrder: p.sortOrder, updatedAt: p.updatedAt });

router.get("/", async (_req, res) => {
  const rows = await db.select().from(projectsTable).orderBy(...ordered);
  res.json(rows.map(toAdminProject));
});

router.post("/", async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: fromError(parsed.error).toString() });
    return;
  }
  // New projects go to the top of the list.
  const [{ min } = { min: 0 }] = await db.select({ min: sql<number>`coalesce(min(${projectsTable.sortOrder}), 0)::int` }).from(projectsTable);
  const [row] = await db
    .insert(projectsTable)
    .values({ ...parsed.data, sortOrder: (min ?? 0) - 1, createdBy: req.admin!.id, updatedBy: req.admin!.id })
    .returning();
  res.status(201).json(toAdminProject(row!));
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const parsed = projectSchema.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) {
    res.status(400).json({ error: parsed.success ? "Invalid id." : fromError(parsed.error).toString() });
    return;
  }
  const [row] = await db
    .update(projectsTable)
    .set({ ...parsed.data, updatedBy: req.admin!.id, updatedAt: new Date() })
    .where(eq(projectsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Project not found." });
    return;
  }
  res.json(toAdminProject(row));
});

router.post("/:id/move", async (req, res) => {
  const id = Number(req.params["id"]);
  const dir = req.body?.direction;
  if (!Number.isInteger(id) || (dir !== "up" && dir !== "down")) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: projectsTable.id }).from(projectsTable).orderBy(...ordered);
    const i = rows.findIndex((r) => r.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j]!, rows[i]!];
    for (let k = 0; k < rows.length; k++) {
      await tx.update(projectsTable).set({ sortOrder: k }).where(eq(projectsTable.id, rows[k]!.id));
    }
  });
  const rows = await db.select().from(projectsTable).orderBy(...ordered);
  res.json(rows.map(toAdminProject));
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const [row] = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning({ id: projectsTable.id });
  if (!row) {
    res.status(404).json({ error: "Project not found." });
    return;
  }
  req.log.info({ by: req.admin!.id, projectId: id }, "Project deleted");
  res.json({ ok: true });
});

export default router;
