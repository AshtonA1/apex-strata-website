import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { securityHeaders } from "./middlewares/auth";
import { logger } from "./lib/logger";

const app: Express = express();

// Behind the Replit proxy: trust one hop so req.ip is the real client and req.secure reflects https.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use("/api", securityHeaders, router);

// Last resort: never leak stack traces to the browser.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled error");
  if (res.headersSent) return;
  const status = typeof (err as { status?: number })?.status === "number" ? (err as { status: number }).status : 500;
  res.status(status >= 400 && status < 600 ? status : 500).json({ error: status === 400 ? "Bad request." : "Internal server error" });
});

export default app;
