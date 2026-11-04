import Link from "next/link";
import {
  BarChart3,
  Coins,
  Percent,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import { getSalesReport } from "@/lib/admin-data";
import { statusLabel } from "@/lib/constants";
import { cn, formatDate, formatPKR, formatNumber } from "@/lib/utils";
import { AdminPageHeader, EmptyState, Panel, StatCard } from "@/components/admin/admin-ui";

export const metadata = { title: "Sales & profit" };

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const requested = Number(params.days ?? 30);
  const days = RANGES.some((range) => range.days === requested) ? requested : 30;
  const report = await getSalesReport(days);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Sales & profit"
        description="Revenue, estimated profit and best sellers. Profit figures are private and never shown to customers."
      >
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((range) => (
            <Link
              key={range.days}
              href={`/admin/reports?days=${range.days}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition",
                days === range.days
                  ? "border-chocolate bg-chocolate text-cream-50"
                  : "border-chocolate/10 bg-white text-chocolate/50 hover:border-gold-300",
              )}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPKR(report.revenue)}
          hint={`${formatNumber(report.orders.length)} completed orders`}
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Estimated profit"
          value={formatPKR(report.profit)}
          hint="Private estimate"
          icon={<Sparkles className="size-4" />}
        />
        <StatCard
          label="Average order"
          value={formatPKR(report.averageOrder)}
          hint="Revenue ÷ orders"
          icon={<BarChart3 className="size-4" />}
        />
        <StatCard
          label="Delivery collected"
          value={formatPKR(report.deliveryFees)}
          hint={`${formatPKR(report.discounts)} discounts given`}
          icon={<Truck className="size-4" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel className="p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
              <Coins className="size-4" />
            </span>
            <div>
              <h3 className="font-display text-xl text-chocolate">Best sellers</h3>
              <p className="text-[10px] text-chocolate/40">
                Ranked by revenue in the selected period.
              </p>
            </div>
          </div>

          {report.topProducts.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="size-5" />}
              title="No sales in this period"
              description="Try a longer date range or check back after your next order."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {report.topProducts.map((product, index) => {
                const max = report.topProducts[0]?.revenue || 1;
                return (
                  <div key={product.name}>
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="flex items-center gap-2 font-medium text-chocolate">
                        <span className="flex size-5 items-center justify-center rounded-full bg-cream-100 text-[8px] font-bold text-chocolate/50">
                          {index + 1}
                        </span>
                        {product.name}
                      </span>
                      <span className="text-chocolate/50">
                        {formatNumber(product.quantity)} sold ·{" "}
                        <span className="font-semibold text-chocolate">
                          {formatPKR(product.revenue)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-chocolate"
                        style={{ width: `${Math.max(4, (product.revenue / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
              <Percent className="size-4" />
            </span>
            <h3 className="font-display text-xl text-chocolate">Orders by status</h3>
          </div>
          {report.statusCounts.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-chocolate/15 px-4 py-6 text-center text-[11px] text-chocolate/40">
              No orders in this period.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {report.statusCounts.map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl bg-cream-50 px-3.5 py-2.5 text-[11px]"
                >
                  <span className="text-chocolate/60">{statusLabel(status)}</span>
                  <span className="font-semibold text-chocolate">{formatNumber(count)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <div className="flex items-center justify-between border-b border-chocolate/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ReceiptText className="size-4 text-gold-500" />
            <h3 className="font-display text-xl text-chocolate">Orders in period</h3>
          </div>
          <span className="text-[10px] text-chocolate/35">
            {formatNumber(report.orders.length)} orders
          </span>
        </div>

        {report.orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptText className="size-5" />}
            title="No orders to report"
            description="Orders placed in this date range will be listed here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-chocolate/8 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  <th className="px-5 py-3.5 sm:px-6">Order</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                  <th className="px-5 py-3.5 text-right sm:px-6">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chocolate/8">
                {report.orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-cream-50/70">
                    <td className="px-5 py-3.5 sm:px-6">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-chocolate hover:text-gold-500"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[10px] text-chocolate/45">
                      {formatDate(order.created_at, true)}
                    </td>
                    <td className="px-4 py-3.5 text-[10px] text-chocolate/55">
                      {statusLabel(order.status)}
                    </td>
                    <td className="px-4 py-3.5 text-[10px] capitalize text-chocolate/45">
                      {order.payment_status}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[12px] font-semibold text-chocolate">
                      {formatPKR(order.total)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[11px] text-chocolate/55 sm:px-6">
                      {formatPKR(order.estimated_profit)}
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
