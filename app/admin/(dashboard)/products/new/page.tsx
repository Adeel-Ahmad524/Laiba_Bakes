import { getAdminCategories } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <AdminPageHeader
        title="Add a product"
        description="Create a new cake or treat. Prices are stored in the database and used at checkout."
      />
      <ProductForm categories={categories} />
    </div>
  );
}
