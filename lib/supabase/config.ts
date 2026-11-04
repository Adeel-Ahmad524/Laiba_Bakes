const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

export const SUPABASE_URL = rawUrl;
export const SUPABASE_ANON_KEY = rawAnonKey;
export const SUPABASE_SERVICE_ROLE_KEY = rawServiceKey;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("your-project-ref") &&
    !SUPABASE_ANON_KEY.startsWith("your-"),
);

export const isSupabaseAdminConfigured = Boolean(
  isSupabaseConfigured &&
    SUPABASE_SERVICE_ROLE_KEY &&
    !SUPABASE_SERVICE_ROLE_KEY.startsWith("your-"),
);

export const STORAGE_BUCKETS = {
  products: "product-images",
  references: "cake-references",
} as const;
