import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add a category"
        description="Create a collection to organise cakes on the website."
      />
      <CategoryForm />
    </div>
  );
}
