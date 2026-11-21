/**
 * Public Supabase config.
 * Use direct process.env.NEXT_PUBLIC_* access (no optional chaining on the
 * env object) so Next.js can inline these into the client bundle.
 */

function readUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
}

function readAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
}

/** True when public Supabase env vars are present (.env or .env.local). */
export function isSupabaseConfigured(): boolean {
  return Boolean(readUrl() && readAnonKey());
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = readUrl();
  const anonKey = readAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env / .env.local",
    );
  }
  return { url, anonKey };
}
