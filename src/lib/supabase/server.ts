import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Server-only Supabase client, authenticated with the service-role key.
 *
 * This intentionally BYPASSES Row Level Security — both `bookings` and
 * `blocked_weeks` have RLS enabled with no policies for the anon/
 * authenticated roles, so this is the only way to read or write them at
 * all. It must never be imported into a Client Component or any module
 * that could end up in a browser bundle — the `import "server-only"`
 * above makes that a build error if it ever happens.
 *
 * The browser never talks to Supabase directly. It only ever calls our
 * own API routes (src/app/api/**), which validate the request and then
 * use this client internally.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase server credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in your environment — see .env.example and " +
        "docs/booking-backend.md."
    );
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}
