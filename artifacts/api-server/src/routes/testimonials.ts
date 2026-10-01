import { Router, type IRouter } from "express";
import { db, testimonialsTable, insertTestimonialSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { fromError } from "zod-validation-error";

const router: IRouter = Router();

router.get("/testimonials", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.approved, true))
      .orderBy(testimonialsTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch testimonials");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/testimonials", async (req, res) => {
  const parsed = insertTestimonialSchema.safeParse(req.body);
  if (!parsed.success) {
    const readable = fromError(parsed.error);
    res.status(400).json({ error: readable.toString() });
    return;
  }
  try {
    const [row] = await db
      .insert(testimonialsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to create testimonial");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
