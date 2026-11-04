import type { CartItem, OrderItem, PricingType } from "./types";

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * A cake's flavour price is per pound. Size reference prices are never added
 * on top of the flavour price; pounds are simply multiplied by the flavour's
 * per-pound rate. Fixed-price products ignore pounds entirely.
 */
export function calculateLineTotal(input: {
  pricingType: PricingType;
  unitPrice: number;
  pounds?: number | null;
  quantity: number;
}) {
  const quantity = Math.max(1, Math.trunc(input.quantity));
  const unitPrice = Math.max(0, input.unitPrice);
  if (input.pricingType === "per_pound") {
    const pounds = Math.max(1, input.pounds ?? 1);
    return roundMoney(unitPrice * pounds * quantity);
  }
  return roundMoney(unitPrice * quantity);
}

export function calculateCartItemTotal(item: CartItem) {
  return calculateLineTotal({
    pricingType: item.pricingType,
    unitPrice: item.unitPrice,
    pounds: item.pounds,
    quantity: item.quantity,
  });
}

export function calculateCartTotals(items: CartItem[]) {
  const cakeItems = items.filter((item) => item.pricingType === "per_pound");
  const extraItems = items.filter((item) => item.pricingType === "fixed");
  const cakeSubtotal = cakeItems.reduce(
    (total, item) => total + calculateCartItemTotal(item),
    0,
  );
  const additionalTotal = extraItems.reduce(
    (total, item) => total + calculateCartItemTotal(item),
    0,
  );
  return {
    cakeSubtotal: roundMoney(cakeSubtotal),
    additionalTotal: roundMoney(additionalTotal),
    subtotal: roundMoney(cakeSubtotal + additionalTotal),
  };
}

export function calculateDeliveryCharge(input: {
  deliveryType: "delivery" | "pickup";
  goodsTotal: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}) {
  if (input.deliveryType === "pickup") return 0;
  if (
    input.freeDeliveryThreshold > 0 &&
    input.goodsTotal >= input.freeDeliveryThreshold
  ) {
    return 0;
  }
  return roundMoney(Math.max(0, input.deliveryCharge));
}

export function calculateDiscount(input: {
  goodsTotal: number;
  discountType: "percentage" | "fixed" | null;
  discountValue: number;
  minimumOrder?: number;
}) {
  if (!input.discountType) return 0;
  if ((input.minimumOrder ?? 0) > 0 && input.goodsTotal < (input.minimumOrder ?? 0)) {
    return 0;
  }
  if (input.discountType === "percentage") {
    const percentage = Math.min(100, Math.max(0, input.discountValue));
    return roundMoney((input.goodsTotal * percentage) / 100);
  }
  return roundMoney(Math.min(input.goodsTotal, Math.max(0, input.discountValue)));
}

export function calculateOrderTotal(input: {
  cakeSubtotal: number;
  additionalTotal: number;
  decorationCharge: number;
  deliveryCharge: number;
  discount: number;
}) {
  return roundMoney(
    Math.max(
      0,
      input.cakeSubtotal +
        input.additionalTotal +
        input.decorationCharge +
        input.deliveryCharge -
        input.discount,
    ),
  );
}

export function estimateProfit(input: {
  cakeItems: Array<Pick<OrderItem, "pounds" | "quantity"> | { pounds: number | null; quantity: number }>;
  profitPerPound: number;
}) {
  const pounds = input.cakeItems.reduce(
    (total, item) =>
      total + Math.max(0, item.pounds ?? 0) * Math.max(0, item.quantity),
    0,
  );
  return roundMoney(pounds * Math.max(0, input.profitPerPound));
}

export function cartItemKey(productId: string, pounds: number | null) {
  return pounds ? `${productId}:${pounds}` : productId;
}
