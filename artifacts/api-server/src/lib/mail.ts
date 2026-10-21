import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger";

export type MailResult = { ok: true } | { ok: false; error: string };

/**
 * SMTP settings come from environment variables (Replit Secrets). Nothing is hard-coded.
 *   SMTP_HOST   e.g. mail.apexstrataconsulting.co.zw (cPanel: "Mail Server" in Email Accounts -> Connect Devices)
 *   SMTP_PORT   465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER   full mailbox address, e.g. info@apexstrataconsulting.co.zw
 *   SMTP_PASS   that mailbox's password
 *   SMTP_FROM   optional, defaults to SMTP_USER. e.g. "Apex Strata Consulting <info@apexstrataconsulting.co.zw>"
 *   SMTP_REPLY_TO optional. Where clients' answers go. Defaults to the From address. No staff
 *               name or personal address is ever put on outgoing mail.
 *   SMTP_SECURE optional "true"/"false". Defaults to true when the port is 465.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env["SMTP_HOST"] && process.env["SMTP_USER"] && process.env["SMTP_PASS"]);
}

let transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env["SMTP_PORT"] ?? 465);
  const secure = process.env["SMTP_SECURE"] ? process.env["SMTP_SECURE"] === "true" : port === 465;
  transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"],
    port,
    secure,
    auth: { user: process.env["SMTP_USER"], pass: process.env["SMTP_PASS"] },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<MailResult> {
  if (!mailConfigured()) {
    return { ok: false, error: "Email sending isn't configured on the server yet (SMTP settings missing)." };
  }
  const fromAddr = process.env["SMTP_FROM"] ?? process.env["SMTP_USER"]!;
  try {
    await getTransporter().sendMail({
      from: { name: "Apex Strata Consulting", address: extractAddress(fromAddr) },
      to: opts.to,
      replyTo: process.env["SMTP_REPLY_TO"] ?? extractAddress(fromAddr),
      subject: oneLine(opts.subject),
      text: opts.text,
    });
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "SMTP send failed");
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `The mail server rejected the message: ${msg}`.slice(0, 300) };
  }
}

function extractAddress(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1]! : from).trim();
}
