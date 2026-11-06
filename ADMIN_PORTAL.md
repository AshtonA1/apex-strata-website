# Apex Strata admin portal: setup notes

Sign-in page: `/admin` (linked as "Staff login" in the site footer).

## How the pieces fit

| Piece | Where it runs | What it does |
|---|---|---|
| Website (React) | Vercel | The public pages and the `/admin` screens |
| API (`artifacts/api-server`, Express) | Railway | Contact form, projects, testimonials, portal login and inbox |
| Database | Supabase (Postgres) | Admins, sessions, projects, inquiries, replies, testimonials |

The browser must see the API on the **same domain** as the site (the login cookie is `SameSite=Strict`, path `/api`), so Vercel forwards `/api/*` to Railway (step 6).

## One-time setup

**1. Supabase connection string.** In your Supabase project: *Connect* > *Session pooler* > copy the URI (host like `aws-0-xx.pooler.supabase.com`, port **5432**, user `postgres.<project-ref>`). Put your database password in place of `[YOUR-PASSWORD]`; if it contains characters such as `@ # / ?`, URL-encode them (`@` = `%40`, `#` = `%23`). Use the session pooler, not the direct host: the direct host is IPv6-only on Supabase's free plan, and Railway/Vercel are IPv4. This is `DATABASE_URL`. The code switches TLS on automatically for any non-local host, so you do not need `?sslmode=...`.

**2. Create the tables** (needs a terminal: a laptop, or GitHub Codespaces from a phone browser):
```
pnpm install
DATABASE_URL="<the Supabase URI>" pnpm --filter @workspace/db run push
```

**3. Lock the tables down.** Supabase exposes every table in the `public` schema through its own REST API. Turn row-level security on so nothing is readable that way (this API connects as the database owner, which is unaffected). Supabase > *SQL Editor* > run:
```sql
alter table admins enable row level security;
alter table admin_sessions enable row level security;
alter table projects enable row level security;
alter table inquiries enable row level security;
alter table inquiry_replies enable row level security;
alter table testimonials enable row level security;
```
Run it again after any future `db push` that adds a table.

**4. Create the first owner** (same terminal as step 2; the password is read from `ADMIN_PASSWORD`, min 12 characters):
```
DATABASE_URL="<the Supabase URI>" ADMIN_PASSWORD="<a long password>" pnpm --filter @workspace/api-server run setup-owner -- you@company.com "Your Name"
```
It creates the owner and loads the starting projects (the Bitumen, Kavango and Old Nic projects pinned). Safe to run again: it never creates a second owner or duplicates projects. Do not save the password in a file or in git.

**5. Deploy the API to Railway.** New service from the GitHub repo. Build: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`. Start: `pnpm --filter @workspace/api-server run start`. Variables:

| Name | Value |
|---|---|
| `DATABASE_URL` | the Supabase URI from step 1 |
| `NODE_ENV` | `production` |
| `TRUST_PROXY_HOPS` | `2` (Vercel + Railway). Use `1` if the site calls Railway directly |
| `SMTP_HOST` | e.g. `mail.apexstrataconsulting.co.zw` (cPanel: Email Accounts > Connect Devices) |
| `SMTP_PORT` | `465` (SSL) or `587` (STARTTLS) |
| `SMTP_USER` | a real mailbox, e.g. `info@apexstrataconsulting.co.zw` |
| `SMTP_PASS` | that mailbox's password |
| `SMTP_FROM`, `SMTP_REPLY_TO` | optional; default to `SMTP_USER` |

Railway sets `PORT` itself. Without the SMTP variables the portal still works, but replies are saved as "not delivered" and the dashboard shows a warning. Replies go out as "Apex Strata Consulting" from the company mailbox, with no staff name.

**6. Point Vercel's `/api` at Railway.** In `vercel.json` (project root as configured in Vercel), add a rewrite for `/api/:path*` to `https://<your-railway-domain>/api/:path*`. Keep any existing rewrites; do not replace them.

**7. Sign in** at `/admin` (also the "Staff login" link in the footer), open **Team** and add the other people. Each gets a one-time temporary password and must choose their own at first sign-in.

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

## Pinning projects

On **Projects**, the pin button next to each project keeps it at the top of the public Projects page, above everything unpinned. The arrows reorder projects within the pinned group and within the unpinned group. Currently pinned by default (fresh installs): the Bitumen World Mining, Kavango and Old Nic Mine projects.

If the database was created before pinning existed, run the step 2 command again once (it adds a `pinned` column), then pin those projects from the portal. The seed only runs on an empty table.
