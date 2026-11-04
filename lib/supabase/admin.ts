import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  isSupabaseAdminConfigured,
} from "./config";

/**
 * Service-role client. Never import this file into a Client Component.
 * It bypasses RLS and is only used after server-side validation.
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured) {
    throw new Error("Supabase admin credentials are not configured.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
