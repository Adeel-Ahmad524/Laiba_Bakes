"use server";

import { redirect } from "next/navigation";
import { flattenZodErrors, adminLoginSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { getSafeRedirectPath } from "@/lib/redirects";

export interface AuthActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function loginAdminAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured || !isSupabaseAdminConfigured) {
    return {
      ok: false,
      message:
        "Supabase is not configured yet. Add your environment variables and run the database migration first.",
    };
  }

  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, errors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      ok: false,
      message: "Incorrect email or password. Please try again.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: adminUser } = await admin
    .from("admin_users")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminUser) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "This account is not an administrator. Ask the site owner to add it to admin_users.",
    };
  }

  const next = getSafeRedirectPath(String(formData.get("next") ?? ""), "/admin");
  redirect(next);
}

export async function logoutAdminAction() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
