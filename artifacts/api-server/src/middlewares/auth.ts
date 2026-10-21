import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type { Admin } from "@workspace/db";
import { loadSession } from "../lib/session";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: Admin;
      csrfToken?: string;
      sessionHash?: string;
    }
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Requires a valid session. For writes it also requires the CSRF header that matches the session. */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const s = await loadSession(req);
    if (!s) {
      res.status(401).json({ error: "Not signed in." });
      return;
    }
    if (!SAFE_METHODS.has(req.method)) {
      const header = req.get("x-csrf-token");
      if (!header || !safeEqual(header, s.csrfToken)) {
        res.status(403).json({ error: "Security check failed. Refresh the page and try again." });
        return;
      }
    }
    req.admin = s.admin;
    req.csrfToken = s.csrfToken;
    req.sessionHash = s.tokenHash;
    next();
  } catch (err) {
    req.log.error({ err }, "Auth check failed");
    res.status(500).json({ error: "Internal server error" });
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (req.admin?.role !== "owner") {
    res.status(403).json({ error: "Only the account owner can do that." });
    return;
  }
  next();
}

/** Blocks everything except changing the password while an account is flagged to change it. */
export function blockUntilPasswordChanged(req: Request, res: Response, next: NextFunction) {
  if (req.admin?.mustChangePassword) {
    res.status(403).json({ error: "You must change your password first.", code: "PASSWORD_CHANGE_REQUIRED" });
    return;
  }
  next();
}

/** Security headers + no caching for the whole API. */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
  next();
}
