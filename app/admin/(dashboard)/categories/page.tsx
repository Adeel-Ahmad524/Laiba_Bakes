/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { FolderTree, Pencil, Plus } from "lucide-react";
import { getAdminCategories } from "@/lib/admin-data";
import { deleteCategoryAction } from "@/app/actions/admin";
import { AdminSuccess } from "@/components/admin/admin-banners";
import { DeleteForm } from "@/components/admin/delete-form";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/admin-ui";
import { formatNumber, truncate } from "@/lib/utils";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [params, categories] = await Promise.all([searchParams, getAdminCategories()]);

  return (
    <div className="space-y-5">
      {params.saved ? <AdminSuccess>Category saved successfully.</AdminSuccess> : null}
      {params.deleted ? <AdminSuccess>Category deleted.</AdminSuccess> : null}

      <AdminPageHeader
        title="Categories"
        description="Group cakes into collections such as birthdays, weddings and little treats."
      >
        <Link href="/admin/categories/new" className="btn-primary min-h-10 px-5 text-[11px]">
          <Plus className="size-3.5" />
          Add category
        </Link>
      </AdminPageHeader>

      <Panel>
        {categories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="size-5" />}
            title="No categories yet"
            description="Create categories to help customers browse your cakes."
          >
            <Link href="/admin/categories/new" className="btn-primary min-h-10 px-5 text-[11px]">
              Add category
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-chocolate/8 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/8">
                {categories.map((category) => (
                  <tr key={category.id} className="transition hover:bg-cream-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="block size-11 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center text-chocolate/25">
                              <FolderTree className="size-4" />
                            </span>
                          )}
                        </span>
                        <div>
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="text-[12px] font-semibold text-chocolate hover:text-gold-500"
                          >
                            {category.name}
                          </Link>
                          <p className="text-[9px] text-chocolate/35">/{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-[11px] text-chocolate/50">
                      {category.description ? truncate(category.description, 80) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-chocolate/45">
                      {formatNumber(category.sort_order)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          category.is_active
                            ? "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-700"
                            : "rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-stone-500"
                        }
                      >
                        {category.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-chocolate/10 bg-white text-chocolate/50 transition hover:border-gold-300 hover:text-chocolate"
                          aria-label={`Edit ${category.name}`}
                          title="Edit category"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <DeleteForm
                          id={category.id}
                          action={deleteCategoryAction}
                          compact
                          confirmMessage={`Delete ${category.name}? Products will remain but lose this category.`}
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
