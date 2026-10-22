// Build-time pre-rendering: turns each public page into real HTML so search engines (and AI
// crawlers that don't run JavaScript) see the content immediately. Also writes sitemap.xml,
// adds canonical links and appends the Sitemap line to robots.txt.
//
// Settings (all optional):
//   SITE_URL                   default https://apexstrataconsulting.co.zw
//   GOOGLE_SITE_VERIFICATION   token from Google Search Console ("HTML tag" method)
//   BING_SITE_VERIFICATION     token from Bing Webmaster Tools ("HTML meta tag" method)
//   OUT_DIR                    where the built site is (default dist/public)
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const appDir = path.resolve(import.meta.dirname, "..");
const outDir = path.resolve(appDir, process.env.OUT_DIR ?? "dist/public");
const serverDir = path.resolve(appDir, "dist/server");
const SITE = (process.env.SITE_URL ?? "https://apexstrataconsulting.co.zw").replace(/\/+$/, "");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

async function main() {
  const entry = readdirSync(serverDir).find((f) => /^entry-server\.(m?js)$/.test(f));
  if (!entry) throw new Error("server bundle not found in " + serverDir);
  const { render, PAGES, fullTitle } = await import(pathToFileURL(path.join(serverDir, entry)).href);

  const template = readFileSync(path.join(outDir, "index.html"), "utf8");
  if (!template.includes('<div id="root"></div>')) throw new Error("index.html has no empty #root");

  const verify = [
    process.env.GOOGLE_SITE_VERIFICATION && `<meta name="google-site-verification" content="${esc(process.env.GOOGLE_SITE_VERIFICATION)}" />`,
    process.env.BING_SITE_VERIFICATION && `<meta name="msvalidate.01" content="${esc(process.env.BING_SITE_VERIFICATION)}" />`,
  ].filter(Boolean).join("\n    ");

  const results = [];
  for (const [key, page] of Object.entries(PAGES)) {
    const html = render(page.path);
    if (!html || html.length < 500) throw new Error(`render of ${page.path} produced almost nothing`);
    const title = esc(fullTitle(key));
    const desc = esc(page.description);
    const url = SITE + (page.path === "/" ? "/" : page.path);

    let out = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(
        "</head>",
        `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n    ${verify}\n  </head>`,
      )
      .replace('<div id="root"></div>', `<div id="root" data-prerendered="${page.path}">${html}</div>`);
    results.push({ page, out });
  }

  // All rendered fine: write everything.
  for (const { page, out } of results) {
    const file = page.path === "/" ? path.join(outDir, "index.html") : path.join(outDir, page.path.slice(1), "index.html");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, out);
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = results
    .map(({ page }) => `  <url><loc>${SITE}${page.path === "/" ? "/" : page.path}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n");
  writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

  const robots = path.join(outDir, "robots.txt");
  const base = existsSync(robots) ? readFileSync(robots, "utf8").replace(/\s*$/, "\n") : "User-agent: *\nAllow: /\n";
  writeFileSync(robots, `${base}Sitemap: ${SITE}/sitemap.xml\n`);

  console.log(`prerender: wrote ${results.length} pages + sitemap.xml for ${SITE}`);
}

main().catch((err) => {
  // Never fail the deploy over this: the normal single-page site is already built and works.
  console.warn("prerender: SKIPPED (site still works, just without pre-rendered HTML):", err?.message ?? err);
  process.exit(0);
});
