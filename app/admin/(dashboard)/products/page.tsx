/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CakeSlice, Pencil, Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/admin-data";
import { deleteProductAction } from "@/app/actions/admin";
import { AdminError, AdminSuccess } from "@/components/admin/admin-banners";
import { DeleteForm } from "@/components/admin/delete-form";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/admin-ui";
import { formatPKR, formatNumber } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [params, products] = await Promise.all([searchParams, getAdminProducts()]);

  return (
    <div className="space-y-5">
      {params.saved === "created" ? <AdminSuccess>Product created successfully.</AdminSuccess> : null}
      {params.saved === "updated" ? <AdminSuccess>Product updated successfully.</AdminSuccess> : null}
      {params.deleted ? <AdminSuccess>Product deleted.</AdminSuccess> : null}
      {params.saved === "error" ? <AdminError>That product could not be saved.</AdminError> : null}

      <AdminPageHeader
        title="Products"
        description="Manage every cake and treat, its price, photograph and visibility."
      >
        <Link href="/admin/products/new" className="btn-primary min-h-10 px-5 text-[11px]">
          <Plus className="size-3.5" />
          Add product
        </Link>
      </AdminPageHeader>

      <Panel>
        {products.length === 0 ? (
          <EmptyState
            icon={<CakeSlice className="size-5" />}
            title="No products yet"
            description="Add your first cake or treat to start taking orders."
          >
            <Link href="/admin/products/new" className="btn-primary min-h-10 px-5 text-[11px]">
              Add product
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-chocolate/8 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Visibility</th>
                  <th className="px-4 py-3.5">Order</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/8">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-cream-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="relative block size-11 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-chocolate/25">
                              <CakeSlice className="size-4" />
                            </span>
                          )}
                        </span>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-[12px] font-semibold text-chocolate hover:text-gold-500"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[9px] text-chocolate/35">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-chocolate/55">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12px] font-semibold text-chocolate">
                        {formatPKR(product.price)}
                      </p>
                      <p className="text-[9px] text-chocolate/35">
                        {product.pricing_type === "per_pound" ? "per pound" : "fixed"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={
                            product.is_active
                              ? "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-700"
                              : "rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-stone-500"
                          }
                        >
                          {product.is_active ? "Active" : "Hidden"}
                        </span>
                        {product.is_featured ? (
                          <span className="rounded-full border border-gold-300 bg-gold-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-chocolate">
                            Featured
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-chocolate/45">
                      {formatNumber(product.sort_order ?? 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-chocolate/10 bg-white text-chocolate/50 transition hover:border-gold-300 hover:text-chocolate"
                          aria-label={`Edit ${product.name}`}
                          title="Edit product"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <DeleteForm
                          id={product.id}
                          action={deleteProductAction}
                          compact
                          confirmMessage={`Delete ${product.name}? This cannot be undone.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
