import { OrderPageClient } from "@/components/site/order-page-client";
import {
  getCakeSizes,
  getDeals,
  getDecorations,
  getProducts,
  getSettings,
} from "@/lib/data";

export const metadata = {
  title: "Place an Order",
  description:
    "Order cakes and bakery treats online from Laiba Bakes. Cash on delivery or pickup, with a secure server-validated order summary.",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    pounds?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const requestedPounds = Number(params.pounds);
  const presetPounds =
    Number.isFinite(requestedPounds) && requestedPounds > 0
      ? requestedPounds
      : undefined;
  const [products, sizes, decorations, deals, settings] = await Promise.all([
    getProducts(),
    getCakeSizes(),
    getDecorations(),
    getDeals(),
    getSettings(),
  ]);

  return (
    <OrderPageClient
      products={products}
      sizes={sizes}
      decorations={decorations}
      deals={deals}
      settings={settings}
      presetProductSlug={params.product}
      presetPounds={presetPounds}
      initialType={params.type === "custom" ? "custom" : "standard"}
    />
  );
}
