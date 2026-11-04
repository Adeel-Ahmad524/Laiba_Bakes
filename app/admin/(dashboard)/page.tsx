import Link from "next/link";
import {
  ArrowUpRight,
  CakeSlice,
  Mail,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { getAdminDashboard } from "@/lib/admin-data";
import { formatDate, formatPKR, formatNumber } from "@/lib/utils";
import {
  AdminPageHeader,
  EmptyState,
  Panel,
  StatCard,
  StatusPill,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const data = await getAdminDashboard();
  const maxMonth = Math.max(...data.months.map((month) => month.value), 1);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Good to see you."
        description="A quick look at orders, revenue and everything happening at Laiba Bakes."
      >
        <Link href="/admin/orders?status=new" className="btn-primary min-h-10 px-5 text-[11px]">
          Review new orders
          <ArrowUpRight className="size-3.5" />
        </Link>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders this month"
          value={formatPKR(data.monthRevenue)}
          hint={`${formatNumber(data.totalOrders)} orders all time`}
          icon={<TrendingUp className="size-4" />}
          href="/admin/reports"
        />
        <StatCard
          label="Estimated profit"
          value={formatPKR(data.monthProfit)}
          hint="Private estimate for this month"
          icon={<Sparkles className="size-4" />}
          href="/admin/reports"
        />
        <StatCard
          label="New orders"
          value={formatNumber(data.newOrders)}
          hint="Waiting for confirmation"
          icon={<ShoppingBag className="size-4" />}
          href="/admin/orders?status=new"
        />
        <StatCard
          label="New messages"
          value={formatNumber(data.newMessages)}
          hint={`${formatNumber(data.customerCount)} customers on file`}
          icon={<Mail className="size-4" />}
          href="/admin/messages"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-chocolate/40">
                Revenue trend
              </p>
              <h3 className="mt-1 font-display text-2xl text-chocolate">Last six months</h3>
            </div>
            <span className="chip">Excludes cancelled</span>
          </div>

          <div className="mt-7 flex h-48 items-end gap-3 sm:gap-5">
            {data.months.map((month) => (
              <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[9px] font-semibold text-chocolate/40">
                  {month.value > 0 ? formatPKR(month.value) : "—"}
                </span>
                <div className="flex h-full w-full items-end overflow-hidden rounded-t-xl bg-cream-100">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-chocolate to-gold-400 transition-all"
                    style={{
                      height: `${Math.max(4, (month.value / maxMonth) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-chocolate/45">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-chocolate/40">
            Quick actions
          </p>
          <div className="mt-4 grid gap-2.5">
            {[
              {
                href: "/admin/products/new",
                label: "Add a new product",
                detail: "Cakes, cupcakes and treats",
                icon: CakeSlice,
              },
              {
                href: "/admin/deals/new",
                label: "Create a special deal",
                detail: "Discounts and coupon codes",
                icon: Sparkles,
              },
              {
                href: "/admin/messages",
                label: "Read customer messages",
                detail: "Enquiries from the contact form",
                icon: Mail,
              },
              {
                href: "/admin/settings",
                label: "Update business details",
                detail: "Prices, delivery and contact info",
                icon: Users,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-chocolate/10 px-4 py-3.5 transition hover:border-gold-300 hover:bg-cream-50"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-cream-100 text-gold-500">
                  <item.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-chocolate">
                    {item.label}
                  </span>
                  <span className="block text-[10px] text-chocolate/40">{item.detail}</span>
                </span>
                <ArrowUpRight className="size-3.5 text-chocolate/25 transition group-hover:text-gold-500" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center justify-between gap-3 border-b border-chocolate/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-chocolate/40">
              Latest activity
            </p>
            <h3 className="mt-1 font-display text-2xl text-chocolate">Recent orders</h3>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600"
          >
            All orders
            <ArrowUpRight className="size-3" />
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="No orders yet"
            description="New orders will appear here as soon as customers check out."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-chocolate/8 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  <th className="px-5 py-3 sm:px-6">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right sm:px-6">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/8">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-cream-50/70">
                    <td className="px-5 py-3.5 sm:px-6">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-chocolate hover:text-gold-500"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[12px] font-medium text-chocolate">
                        {order.customer?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-chocolate/40">
                        {order.customer?.phone ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-chocolate/55">
                      {formatDate(order.required_date)}
                      <span className="block text-[9px] text-chocolate/35">
                        {order.delivery_type === "delivery" ? "Delivery" : "Pickup"} ·{" "}
                        {order.required_time}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] font-semibold text-chocolate">
                      {formatPKR(order.total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-[10px] text-chocolate/40 sm:px-6">
                      {formatDate(order.created_at, true)}
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
