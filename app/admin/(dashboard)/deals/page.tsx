/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Pencil, Plus, Tag } from "lucide-react";
import { getAdminDeals } from "@/lib/admin-data";
import { deleteDealAction } from "@/app/actions/admin";
import { AdminSuccess } from "@/components/admin/admin-banners";
import { DeleteForm } from "@/components/admin/delete-form";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/admin-ui";
import { formatDate, formatPKR } from "@/lib/utils";

export const metadata = { title: "Special deals" };

function discountLabel(type: "percentage" | "fixed", value: number) {
  return type === "percentage" ? `${value}% off` : `${formatPKR(value)} off`;
}

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [params, deals] = await Promise.all([searchParams, getAdminDeals()]);

  return (
    <div className="space-y-5">
      {params.saved ? <AdminSuccess>Special deal saved successfully.</AdminSuccess> : null}
      {params.deleted ? <AdminSuccess>Special deal deleted.</AdminSuccess> : null}

      <AdminPageHeader
        title="Special deals"
        description="Create discounts and coupon codes for the website and checkout."
      >
        <Link href="/admin/deals/new" className="btn-primary min-h-10 px-5 text-[11px]">
          <Plus className="size-3.5" />
          Add deal
        </Link>
      </AdminPageHeader>

      <Panel>
        {deals.length === 0 ? (
          <EmptyState
            icon={<Tag className="size-5" />}
            title="No special deals yet"
            description="Add a coupon code or seasonal offer to share with your customers."
          >
            <Link href="/admin/deals/new" className="btn-primary min-h-10 px-5 text-[11px]">
              Add deal
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-chocolate/8 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  <th className="px-5 py-3.5">Offer</th>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Minimum</th>
                  <th className="px-4 py-3.5">Validity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/8">
                {deals.map((deal) => (
                  <tr key={deal.id} className="transition hover:bg-cream-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="block size-11 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                          {deal.image_url ? (
                            <img src={deal.image_url} alt="" className="size-full object-cover" />
                          ) : (
                            <span className="flex size-full items-center justify-center text-chocolate/25">
                              <Tag className="size-4" />
                            </span>
                          )}
                        </span>
                        <div>
                          <Link
                            href={`/admin/deals/${deal.id}`}
                            className="text-[12px] font-semibold text-chocolate hover:text-gold-500"
                          >
                            {deal.title}
                          </Link>
                          <p className="text-[9px] text-chocolate/35">/{deal.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {deal.code ? (
                        <span className="rounded-full border border-gold-300 bg-gold-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-chocolate">
                          {deal.code}
                        </span>
                      ) : (
                        <span className="text-[10px] text-chocolate/35">No code</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[12px] font-semibold text-chocolate">
                      {discountLabel(deal.discount_type, deal.discount_value)}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-chocolate/50">
                      {Number(deal.minimum_order) > 0 ? formatPKR(deal.minimum_order) : "None"}
                    </td>
                    <td className="px-4 py-3.5 text-[10px] leading-4 text-chocolate/45">
                      {deal.starts_at ? formatDate(deal.starts_at) : "Anytime"}
                      <span className="block text-chocolate/30">
                        to {deal.ends_at ? formatDate(deal.ends_at) : "no end date"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          deal.is_active
                            ? "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-700"
                            : "rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-stone-500"
                        }
                      >
                        {deal.is_active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/deals/${deal.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-chocolate/10 bg-white text-chocolate/50 transition hover:border-gold-300 hover:text-chocolate"
                          aria-label={`Edit ${deal.title}`}
                          title="Edit deal"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <DeleteForm
                          id={deal.id}
                          action={deleteDealAction}
                          compact
                          confirmMessage={`Delete the offer “${deal.title}”?`}
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
