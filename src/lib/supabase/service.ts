// src/lib/supabase/service.ts
import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses RLS using the service role key.
// NEVER import this in client components or expose the key to the browser.
// Currently all lists are publicly viewable — if a "draft" or "private"
// mode is added in the future, queries using this client must filter accordingly.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
