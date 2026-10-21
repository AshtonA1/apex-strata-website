import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

// scrypt from node:crypto: memory-hard, no native dependency to compile on Replit.
const N = 32768; // CPU/memory cost (2^15)
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 128 * N * R * 2; // headroom above the 128*N*r minimum

function scrypt(password: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, KEYLEN, opts, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4]!, "base64");
  const expected = Buffer.from(parts[5]!, "base64");
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  const key = await scrypt(password, salt, { N: n, r, p, maxmem: 128 * n * r * 2 });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// A real hash of a random value, used to burn the same time when the email doesn't exist,
// so response timing doesn't reveal which emails are registered.
let dummyHash: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(18).toString("hex"));
  return dummyHash;
}

const COMMON = new Set([
  "password1234",
  "passwordpassword",
  "123456789012",
  "qwertyuiop12",
  "administrator",
  "apexstrata123",
  "apexstrata2026",
  "welcome12345",
]);

/** Returns an error message, or null when the password is acceptable. */
export function checkPasswordStrength(password: string, email?: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  if (COMMON.has(password.toLowerCase())) return "That password is too common. Choose something less guessable.";
  if (/^(.)\1+$/.test(password)) return "Password can't be a single repeated character.";
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) {
    return "Password must not contain your email name.";
  }
  return null;
}
