import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

/**
 * Tiny in-memory fixed-window limiter. Fine for a single server process (which is what this
 * deployment is); if the API is ever scaled to several instances, move this to the database or Redis.
 */
export function createLimiter(opts: { windowMs: number; max: number; message: string; keyPrefix: string }) {
  const buckets = new Map<string, Bucket>();

  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }, 60_000).unref();

  return function limiter(req: Request, res: Response, next: NextFunction) {
    const key = `${opts.keyPrefix}:${req.ip ?? "unknown"}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > opts.max) {
      res.setHeader("Retry-After", String(Math.ceil((b.resetAt - now) / 1000)));
      res.status(429).json({ error: opts.message });
      return;
    }
    next();
  };
}
