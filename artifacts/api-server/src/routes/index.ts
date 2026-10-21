import { Router, type IRouter } from "express";
import healthRouter from "./health";
import testimonialsRouter from "./testimonials";
import adminRouter from "./admin";
import { publicProjectsRouter } from "./admin/projects";
import { publicInquiryRouter } from "./admin/inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(testimonialsRouter);
router.use(publicProjectsRouter);
router.use(publicInquiryRouter);
router.use("/admin", adminRouter);

export default router;
