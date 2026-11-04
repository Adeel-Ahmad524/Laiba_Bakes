import { ShieldCheck } from "lucide-react";
import {
  getAdminDecorations,
  getAdminSettings,
  getAdminSizes,
} from "@/lib/admin-data";
import { AdminError, AdminSuccess } from "@/components/admin/admin-banners";
import { AdminPageHeader, Panel } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import {
  CakeSizeManager,
  DecorationManager,
} from "@/components/admin/settings-managers";

export const metadata = { title: "Business settings" };

const SAVED_MESSAGES: Record<string, string> = {
  "1": "Business settings saved. The website has been updated.",
  size: "Cake sizes saved.",
  decoration: "Decoration options saved.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [settings, sizes, decorations] = await Promise.all([
    getAdminSettings(),
    getAdminSizes(),
    getAdminDecorations(),
  ]);

  return (
    <div className="space-y-6">
      {params.saved ? (
        <AdminSuccess>
          {SAVED_MESSAGES[params.saved] ?? "Settings saved successfully."}
        </AdminSuccess>
      ) : null}
      {params.error ? (
        <AdminError>
          That change could not be saved. Check the values and try again.
        </AdminError>
      ) : null}

      <AdminPageHeader
        title="Business settings"
        description="Control your contact details, delivery charges, profit estimate, sizes and decoration options."
      />

      <SettingsForm settings={settings} />
      <CakeSizeManager sizes={sizes} />
      <DecorationManager decorations={decorations} />

      <Panel className="flex items-start gap-3 bg-cream-100/60 p-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-gold-500">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-chocolate">Private business data</p>
          <p className="mt-1 text-[10px] leading-5 text-chocolate/45">
            Profit estimates, internal order notes and customer records are only
            available to signed-in administrators. Row Level Security protects
            these tables in Supabase, and the public website never receives the
            service role key.
          </p>
        </div>
      </Panel>
    </div>
  );
}
