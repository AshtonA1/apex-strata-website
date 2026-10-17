# Apex Strata website — multi-page restructure

## What changed

The site went from a single scrolling home page to 5 routed pages (Home, Services,
Projects, Team, Contact), using `wouter` (already in your `package.json`, just unused
until now).

## New files

- `src/lib/content.ts` — all site content (services, projects, clients, team, company
  info) in one place. Edit this file to change text/data anywhere on the site without
  touching page layout code.
- `src/lib/motion.ts` — shared framer-motion variants.
- `src/components/layout/nav.tsx` — site-wide nav, now routes between pages instead of
  scrolling to anchors. Transparent-over-hero only on Home; solid bar on every other
  page.
- `src/components/layout/footer.tsx` — site-wide footer with page links.
- `src/components/layout/page-hero.tsx` — reusable banner used at the top of Services,
  Projects, Team, Contact.
- `src/pages/projects.tsx` — **new Projects page**, the one Abercon asked for. Data
  comes from `PROJECTS` in `content.ts`.
- `src/pages/services.tsx`, `src/pages/team.tsx`, `src/pages/contact.tsx` — split out
  of the old single-page `App.tsx`.

## Changed files

- `src/App.tsx` — now a router shell (`wouter` `Switch`/`Route`) wrapping `Nav` +
  `Footer` around whichever page is active, instead of one long page.
- `src/pages/home.tsx` — trimmed down: hero, mission, a 3-service preview linking to
  the full Services page, the new client logos strip, testimonials, CTA.
- `src/pages/not-found.tsx` — restyled to match the site's dark theme (was plain
  white/gray), added a link back to Home.

## Content decisions made for you — review these

1. **Client logos are text wordmarks**, not images — no logo files existed anywhere in
   what you sent. Bitumen World Mining, Kavango Resources, and Old Nic Mine render
   larger/bold as Abercon asked; the rest smaller. Send real logo files (PNG/SVG,
   transparent background) and I'll swap them in.
2. **Projects page data comes from your portfolio PPTX**, not placeholders — all 9
   "Key Projects Overview" entries, marked `status: "Completed"`. To add an in-progress
   or pending project, add an entry to the `PROJECTS` array in `content.ts` with
   `status: "Ongoing"` or `"Pending"` — the status badge color is already wired up for
   all three states.
3. **Added Albert Ngulube** (Principal Geologist) to the Team page — he's in the PPTX
   but wasn't on the live site.
4. **Services list reconciled with the PPTX** — added Advanced Numerical Modelling and
   Third-Party Audits & Design Reviews (new), merged TSF Review with Heap Leach
   Facility Designs into one card. Two of the 8 service cards (Numerical Modelling,
   Third-Party Audits) reuse existing stock photos since no dedicated photo exists for
   them — flagged with a `TODO(Ashton)` comment in `content.ts`.
5. **Team emails switched to the company domain** (`@apexstrataconsulting.com`) instead
   of the personal Gmail addresses the live site had — that's what the PPTX lists.
   **Confirm those inboxes are actually live before this goes out**, or tell me to
   revert to the Gmail addresses.
6. Admin portal (member logins, access control, email) — not built here, that's a
   separate backend-involving feature for a later phase.

## Not included / needs your attention

- `Playfair Display` is referenced in `index.css` as the serif font but was never
  actually linked in `index.html` — it's been silently falling back to Georgia the
  whole time, even on the original single-page site. Minor, pre-existing, your call
  whether to add the Google Fonts link.
- This zip has only the files that changed. Everything else (UI primitives, images,
  configs) in your project is untouched — just drop these into
  `apex-strata-website/<wherever this package lives>/src/` over the existing folder.
