import { notFound } from "next/navigation";
import { getAdminDeal } from "@/lib/admin-data";
import { DealForm } from "@/components/admin/deal-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "Edit deal" };

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getAdminDeal(id);
  if (!deal) notFound();

  return (
    <div>
      <AdminPageHeader
        title={deal.title}
        description="Update the offer details, discount value and validity dates."
      />
      <DealForm deal={deal} />
    </div>
  );
}
