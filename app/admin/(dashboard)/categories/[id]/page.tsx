import { notFound } from "next/navigation";
import { getAdminCategory } from "@/lib/admin-data";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getAdminCategory(id);
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader
        title={category.name}
        description="Update the category name, image and visibility."
      />
      <CategoryForm category={category} />
    </div>
  );
}
