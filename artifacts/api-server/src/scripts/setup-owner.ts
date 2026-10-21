/**
 * One-time setup. Creates the first owner account and loads the 9 existing projects into the
 * database (only if the projects table is empty). Safe to run again: it refuses to create a
 * second owner and never duplicates projects.
 *
 *   pnpm --filter @workspace/api-server run setup-owner -- you@company.com "Your Name"
 *
 * The password is typed at a hidden prompt (or read from ADMIN_PASSWORD for non-interactive use),
 * so it never appears in your shell history, code or git.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { db, pool, adminsTable, projectsTable, type ProjectStatus } from "@workspace/db";
import { checkPasswordStrength, hashPassword } from "../lib/password";

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error("No terminal available. Set ADMIN_PASSWORD in the environment instead."));
      return;
    }
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch: string) => {
      for (const c of ch) {
        if (c === "\r" || c === "\n" || c === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (c === "\u0003") process.exit(130);
        if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const [emailArg, ...nameParts] = process.argv.slice(2).filter((a) => a !== "--");
  const email = emailArg?.trim().toLowerCase();
  const name = nameParts.join(" ").trim();
  if (!email || !email.includes("@") || !name) {
    console.error('Usage: pnpm --filter @workspace/api-server run setup-owner -- you@company.com "Your Name"');
    process.exit(1);
  }

  const [owner] = await db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.role, "owner")).limit(1);
  if (owner) {
    console.log("An owner account already exists, so no new account was created.");
    console.log("Sign in at /admin and add more people from the Team page.");
  } else {
    let password = process.env["ADMIN_PASSWORD"] ?? "";
    if (!password) {
      password = await promptHidden("Choose a password (min 12 characters, hidden): ");
      const again = await promptHidden("Type it again: ");
      if (password !== again) {
        console.error("Passwords didn't match. Nothing was created.");
        process.exit(1);
      }
    }
    const weak = checkPasswordStrength(password, email);
    if (weak) {
      console.error(weak);
      process.exit(1);
    }
    await db.insert(adminsTable).values({ email, name, role: "owner", passwordHash: await hashPassword(password) });
    console.log(`Owner account created for ${email}.`);
  }

  const [{ n } = { n: 0 }] = await db.select({ n: sql<number>`count(*)::int` }).from(projectsTable);
  if (n === 0) {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const seed = JSON.parse(readFileSync(path.join(here, "projects-seed.json"), "utf8")) as {
      title: string;
      client: string;
      clients: string[];
      location: string;
      status: ProjectStatus;
      description: string;
    }[];
    await db.insert(projectsTable).values(seed.map((p, i) => ({ ...p, sortOrder: i })));
    console.log(`Loaded ${seed.length} existing projects into the database.`);
  } else {
    console.log(`Projects table already has ${n} rows, so nothing was seeded.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
