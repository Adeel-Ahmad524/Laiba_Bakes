import { DealForm } from "@/components/admin/deal-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "New deal" };

export default function NewDealPage() {
  return (
    <div>
      <AdminPageHeader
        title="Create a special deal"
        description="Set up a coupon code or seasonal offer. Coupons are validated at checkout."
      />
      <DealForm />
    </div>
  );
}
