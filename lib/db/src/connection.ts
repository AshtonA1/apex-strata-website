/**
 * Shared connection settings for the app and for drizzle-kit.
 *
 * Works with any Postgres, including Supabase:
 *  - localhost / 127.0.0.1 -> plain connection (local development).
 *  - anything else         -> TLS on. Supabase's certificate chain is not in Node's default trust
 *    store, so "require" (which verifies) fails there; we encrypt without verifying the chain.
 *  - DATABASE_SSL=off      -> force plain (e.g. a Postgres on a private network).
 *
 * Any sslmode=... in the URL is removed, so the behaviour is the same however the URL was pasted.
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function isPlain(url: URL): boolean {
  return LOCAL_HOSTS.has(url.hostname) || process.env["DATABASE_SSL"] === "off";
}

/** URL for drizzle-kit (`db push`): it takes TLS settings from the URL, so spell them out. */
export function drizzleKitUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.searchParams.delete("sslmode");
  if (!isPlain(url)) url.searchParams.set("sslmode", "no-verify");
  return url.toString();
}

export function connectionSettings(rawUrl: string): { connectionString: string; ssl: false | { rejectUnauthorized: false } } {
  const url = new URL(rawUrl);
  url.searchParams.delete("sslmode");
  return { connectionString: url.toString(), ssl: isPlain(url) ? false : { rejectUnauthorized: false } };
}
