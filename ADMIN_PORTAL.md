# Apex Strata admin portal: setup notes

Sign-in page: `/admin` (linked as "Staff login" in the site footer).

## One-time setup (Replit)

1. `pnpm install`
2. `pnpm --filter @workspace/db run push`   (creates the new tables: admins, admin_sessions, projects, inquiries, inquiry_replies)
3. `pnpm --filter @workspace/api-server run setup-owner -- you@company.com "Your Name"`
   - Prompts for the password (hidden, min 12 characters). Creates the first **owner** and loads the 9 existing projects into the database.
   - Safe to run again: it won't create a second owner or duplicate projects.
4. Add the email secrets (below), then restart the API server.
5. Sign in at `/admin`, open **Team** and add the other people. Each gets a one-time temporary password and must choose their own at first sign-in.

## Secrets (Replit > Secrets). Needed only for sending replies and new-inquiry alerts

| Name | Example | Notes |
|---|---|---|
| SMTP_HOST | mail.apexstrataconsulting.co.zw | cPanel: Email Accounts > Connect Devices shows the "Outgoing Server" |
| SMTP_PORT | 465 | 465 (SSL) or 587 (STARTTLS) |
| SMTP_USER | info@apexstrataconsulting.co.zw | a real mailbox on the domain |
| SMTP_PASS | (that mailbox's password) | |
| SMTP_FROM | Apex Strata Consulting <info@apexstrataconsulting.co.zw> | optional, defaults to SMTP_USER |
| SMTP_REPLY_TO | info@apexstrataconsulting.co.zw | optional, defaults to the From address |

Replies are sent as "Apex Strata Consulting" from the company mailbox and signed as the company. No staff name or personal address appears on outgoing mail. Clients answer to the company address, so whoever handles that mailbox sees it (in cPanel webmail).
Without these secrets the portal still works; replies are saved but marked "not delivered" and the dashboard shows a warning.

## How access works

- **Owner**: everything, sees every inbox, reassigns messages, manages the team.
- **Admin**: adds/edits/deletes/reorders projects, sees only messages assigned to them. New website inquiries go to the owner, who can reassign them.

## Security summary

- Passwords: scrypt (salted, memory-hard), min 12 characters, never stored or logged in readable form.
- Sessions: random token in an httpOnly, SameSite=Strict, Secure cookie. Only a SHA-256 of the token is stored server-side. 12 h hard limit, 2 h idle timeout, logout deletes the session on the server.
- CSRF: every change needs a per-session token header on top of SameSite=Strict.
- Brute force: 5 wrong passwords locks that account for 15 minutes; 20 attempts per 15 min per IP; identical error for unknown email vs wrong password.
- Contact form: honeypot field, 8 submissions/hour/IP, length limits.
- Not included yet (recommended next): two-factor authentication (TOTP), audit log page, logo upload for new clients.
