import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { createSupabaseAdminClient } from "./supabase/admin";
import { isSupabaseAdminConfigured } from "./supabase/config";

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseAdminConfigured) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("admin_users")
      .select("id, full_name, role, email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) return null;
    return {
      userId: user.id,
      email: data.email ?? user.email ?? "",
      fullName: data.full_name ?? "Administrator",
      role: data.role ?? "admin",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
