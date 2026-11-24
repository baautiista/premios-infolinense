export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  SITE_URL: string;
  ENVIRONMENT?: string;
  TURNSTILE_SITE_KEY?: string;
  /** Secretos (wrangler secret put). */
  TURNSTILE_SECRET?: string;
  VOTE_PEPPER?: string;
  SESSION_SECRET?: string;
}

export const isDev = (env: Env) => env.ENVIRONMENT === "development" || env.ENVIRONMENT === "test";

/** Comprueba que existen los secretos imprescindibles. Nunca hay valores por defecto en producción. */
export function missingSecrets(env: Env): string[] {
  const missing: string[] = [];
  if (!env.VOTE_PEPPER || env.VOTE_PEPPER.length < 24) missing.push("VOTE_PEPPER");
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 24) missing.push("SESSION_SECRET");
  if (!isDev(env) && !env.TURNSTILE_SECRET) missing.push("TURNSTILE_SECRET");
  if (!isDev(env) && !env.TURNSTILE_SITE_KEY) missing.push("TURNSTILE_SITE_KEY");
  return missing;
}
