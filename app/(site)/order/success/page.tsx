import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ReceiptText,
  Truck,
} from "lucide-react";
import { ClearCartOnMount } from "@/components/site/clear-cart-on-mount";
import { CopyOrderId } from "@/components/site/copy-order-id";
import { getSettings } from "@/lib/data";
import { buildWhatsAppLink } from "@/lib/constants";
import { formatDate, formatPKR, safeNumber } from "@/lib/utils";

export const metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const settings = await getSettings();

  const orderNumber = first(params.order) ?? "";
  const name = first(params.name) ?? "";
  const total = safeNumber(first(params.total));
  const requiredDate = first(params.date) ?? "";
  const requiredTime = first(params.time) ?? "";
  const deliveryType = first(params.delivery) === "pickup" ? "pickup" : "delivery";
  const paymentMethod = first(params.payment) ?? "";
  const itemCount = safeNumber(first(params.items));
  const referenceStatus = first(params.ref) ?? "none";

  const whatsappMessage = `Assalam-o-Alaikum Laiba Bakes! I've just placed order ${orderNumber}${total ? ` (total ${formatPKR(total)})` : ""}. I'd like to confirm a few details.`;

  if (!orderNumber) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-8 text-green-700" />
        </span>
        <h1 className="mt-6 font-display text-4xl text-chocolate">
          Thank you for your order.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-chocolate/50">
          Your order request has been sent to the bakery. Our team will review it
          and contact you to confirm the details. Your order is not confirmed
          until then.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={buildWhatsAppLink(
              settings.whatsapp,
              "Assalam-o-Alaikum! I have just placed an order and would like to confirm it.",
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle className="size-4" />
            Message us on WhatsApp
          </a>
          <Link href="/cakes" className="btn-outline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClearCartOnMount />
      <section className="relative overflow-hidden bg-cream-100 py-12 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,199,195,0.5),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(213,177,122,0.2),transparent_40%)]" />
        <div className="container-luxe relative text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-700" />
          </span>
          <span className="eyebrow mt-6 justify-center">Order received</span>
          <h1 className="display-title mt-4">
            Thank you, {name.split(" ")[0] || "friend"}.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-chocolate/55">
            Your order request has been sent to our bakery. Our team will review
            it and contact you on WhatsApp or by phone to confirm the details.
            Your order is not confirmed until then.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-3 rounded-2xl border border-chocolate/10 bg-white p-4 shadow-card">
            <div className="flex-1 text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/40">
                Your order ID
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-wide text-chocolate">
                {orderNumber}
              </p>
            </div>
            <span className="rounded-full border border-gold-300 bg-gold-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-chocolate">
              New request
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-[10px] leading-4 text-chocolate/40">
            Keep this order ID for your records. Our team will quote it when we
            contact you.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-luxe grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-chocolate/10 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-chocolate">
                  Order summary
                </h2>
                <span className="text-[10px] text-chocolate/40">
                  Sent {formatDate(new Date().toISOString(), true)}
                </span>
              </div>

              <div className="mt-5 divide-y divide-chocolate/8">
                <div className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="text-chocolate/50">Items</span>
                  <span className="font-semibold text-chocolate">
                    {itemCount > 0
                      ? `${itemCount} item${itemCount === 1 ? "" : "s"}`
                      : "See order confirmation"}
                  </span>
                </div>
                {total > 0 ? (
                  <div className="flex items-end justify-between gap-3 py-3">
                    <span className="text-sm font-semibold text-chocolate">
                      Total payable
                    </span>
                    <span className="font-display text-3xl font-semibold text-chocolate">
                      {formatPKR(total)}
                    </span>
                  </div>
                ) : null}
              </div>

              {referenceStatus === "skipped" ? (
                <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-3 text-[11px] leading-5 text-amber-700">
                  We could not attach your reference image to the order. Please
                  send it to us on WhatsApp so we can match it to your cake.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-chocolate/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  {deliveryType === "delivery" ? (
                    <Truck className="size-4 text-gold-500" />
                  ) : (
                    <Package className="size-4 text-gold-500" />
                  )}
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                    {deliveryType === "delivery" ? "Delivery" : "Pickup"}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-chocolate">
                  {requiredDate ? formatDate(requiredDate) : "Date to confirm"}
                  {requiredTime ? ` at ${requiredTime}` : ""}
                </p>
                {deliveryType === "pickup" ? (
                  <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
                    <MapPin className="mr-1 inline size-3" />
                    {settings.address}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
                    We will confirm your delivery address when we contact you.
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-chocolate/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-gold-500" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                    Payment
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-chocolate">
                  {paymentMethod || "To confirm"}
                </p>
                <p className="mt-1 text-[11px] text-chocolate/45">
                  Pay on delivery or pickup. No online payment is taken now.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-chocolate/10 bg-chocolate-900 p-6 text-cream-50 shadow-soft sm:p-8">
              <span className="eyebrow text-gold-200">What happens next</span>
              <ol className="mt-5 space-y-4">
                {[
                  "Our team reviews your order and checks availability.",
                  "We contact you on WhatsApp or by phone to confirm.",
                  "Your cake is freshly prepared for your chosen date.",
                  "You collect it or we deliver it to your door.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gold-300/30 text-[10px] font-bold text-gold-200">
                      {index + 1}
                    </span>
                    <span className="text-[12px] leading-5 text-cream-100/65">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-7 space-y-2">
                <a
                  href={buildWhatsAppLink(settings.whatsapp, whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp w-full"
                >
                  <MessageCircle className="size-4" />
                  Confirm on WhatsApp
                </a>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="btn border border-cream-50/20 text-cream-50 hover:bg-cream-50/10"
                >
                  <Phone className="size-4" />
                  Call the bakery
                </a>
              </div>
              <p className="mt-3 text-center text-[9px] leading-4 text-cream-100/35">
                Sending a WhatsApp message helps us find your order, but does not
                confirm it automatically. Confirmation is completed by our team.
              </p>
            </div>

            <div className="rounded-2xl border border-gold-300/40 bg-gold-100/50 p-5">
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4 text-gold-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-chocolate/55">
                  Keep your order ID
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
                <p className="flex-1 font-display text-xl font-semibold tracking-wide text-chocolate">
                  {orderNumber}
                </p>
                <CopyOrderId value={orderNumber} />
              </div>
            </div>

            <Link href="/cakes" className="btn-outline w-full">
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
