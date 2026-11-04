import Link from "next/link";
import { ArrowUpRight, Search, ShoppingBag } from "lucide-react";
import { getAdminOrders } from "@/lib/admin-data";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn, formatDate, formatPKR, formatNumber } from "@/lib/utils";
import { AdminPageHeader, EmptyState, Panel, StatusPill } from "@/components/admin/admin-ui";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const query = params.q ?? "";
  const orders = await getAdminOrders({ status, q: query });

  const tabs = [{ value: "", label: "All orders" }].concat(
    ORDER_STATUSES.map((item) => ({ value: item.value, label: item.label })),
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Orders"
        description="Review, confirm and move every order through preparation and delivery."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <Link
              key={tab.value || "all"}
              href={
                tab.value
                  ? `/admin/orders?status=${tab.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`
                  : `/admin/orders${query ? `?q=${encodeURIComponent(query)}` : ""}`
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider transition",
                status === tab.value
                  ? "border-chocolate bg-chocolate text-cream-50"
                  : "border-chocolate/10 bg-white text-chocolate/50 hover:border-gold-300",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form action="/admin/orders" className="relative w-full lg:w-72">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-chocolate/30" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search order, name or phone"
            className="field py-2.5 pl-10 text-[12px]"
            aria-label="Search orders"
          />
        </form>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate/35">
        {formatNumber(orders.length)} {orders.length === 1 ? "order" : "orders"}
        {status ? ` · ${ORDER_STATUSES.find((item) => item.value === status)?.label ?? status}` : ""}
        {query ? ` · “${query}”` : ""}
      </p>

      <Panel>
        {orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="No orders found"
            description={
              query || status
                ? "Try a different search or status filter."
                : "Orders will appear here once customers complete checkout."
            }
          >
            {query || status ? (
              <Link href="/admin/orders" className="btn-outline min-h-10 px-5 text-[11px]">
                Clear filters
              </Link>
            ) : null}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-chocolate/8 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Required</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/8">
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-cream-50/70">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-chocolate hover:text-gold-500"
                      >
                        {order.order_number}
                        <ArrowUpRight className="size-3 text-chocolate/25" />
                      </Link>
                      <p className="mt-0.5 text-[9px] uppercase tracking-wider text-chocolate/35">
                        {order.order_type === "custom" ? "Custom cake" : "Standard order"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[12px] font-medium text-chocolate">
                        {order.customer?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-chocolate/40">
                        {order.customer?.phone ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-chocolate/55">
                      {formatDate(order.required_date)}
                      <span className="block text-[9px] text-chocolate/35">
                        {order.delivery_type === "delivery" ? "Delivery" : "Pickup"} ·{" "}
                        {order.required_time}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[11px] text-chocolate/60">{order.payment_method}</p>
                      <p className="text-[9px] capitalize text-chocolate/35">
                        {order.payment_status}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[12px] font-semibold text-chocolate">
                      {formatPKR(order.total)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-[10px] text-chocolate/40">
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
