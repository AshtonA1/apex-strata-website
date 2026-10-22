// 1) normal build (must succeed)  2) server build of the same pages  3) pre-render to static HTML.
// Steps 2 and 3 are best-effort: if they fail you still get the normal working site.
import { spawnSync } from "node:child_process";
import path from "node:path";

const appDir = path.resolve(import.meta.dirname, "..");
const run = (cmd, args) => spawnSync(cmd, args, { cwd: appDir, stdio: "inherit", shell: process.platform === "win32" }).status === 0;

if (!run("vite", ["build", "--config", "vite.config.ts"])) process.exit(1);

const ok =
  run("vite", ["build", "--config", "vite.config.ts", "--ssr", "src/entry-server.tsx", "--outDir", "dist/server"]) &&
  run(process.execPath, ["scripts/prerender.mjs"]);
if (!ok) console.warn("Pre-rendering was skipped. The site was built normally.");
