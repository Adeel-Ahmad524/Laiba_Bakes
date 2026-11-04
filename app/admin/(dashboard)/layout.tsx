import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Laiba Bakes Admin",
  },
  robots: { index: false, follow: false },
};

// Admin pages read the authenticated session and live Supabase data on every
// request, so they must never be statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell name={session.fullName} email={session.email}>
      {children}
    </AdminShell>
  );
}
