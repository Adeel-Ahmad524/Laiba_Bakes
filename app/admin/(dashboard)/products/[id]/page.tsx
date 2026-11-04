import { notFound } from "next/navigation";
import { getAdminCategories, getAdminProduct } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        title={product.name}
        description="Update the product details, pricing, photograph and visibility."
      />
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
