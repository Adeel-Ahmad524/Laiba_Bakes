import { describe, expect, it } from "vitest";
import {
  calculateCartTotals,
  calculateDeliveryCharge,
  calculateDiscount,
  calculateLineTotal,
  calculateOrderTotal,
  estimateProfit,
} from "@/lib/pricing";
import type { CartItem } from "@/lib/types";

function cartItem(overrides: Partial<CartItem>): CartItem {
  return {
    key: "item",
    productId: "product-1",
    slug: "cake",
    name: "Cake",
    image: null,
    pricingType: "per_pound",
    unitPrice: 1100,
    pounds: 1,
    quantity: 1,
    ...overrides,
  };
}

describe("calculateLineTotal", () => {
  it("multiplies the flavour per-pound price by pounds and quantity", () => {
    expect(
      calculateLineTotal({
        pricingType: "per_pound",
        unitPrice: 1100,
        pounds: 2,
        quantity: 1,
      }),
    ).toBe(2200);
  });

  it("never adds the size reference price to the flavour price", () => {
    // A 2 lb cake at Rs 1,100/lb is Rs 2,200 — not 2,200 + 2,000.
    expect(
      calculateLineTotal({
        pricingType: "per_pound",
        unitPrice: 1100,
        pounds: 2,
        quantity: 1,
      }),
    ).toBe(2200);
  });

  it("uses the full per-pound price for a 1 lb cake", () => {
    expect(
      calculateLineTotal({
        pricingType: "per_pound",
        unitPrice: 1300,
        pounds: 1,
        quantity: 2,
      }),
    ).toBe(2600);
  });

  it("ignores pounds for fixed-price products", () => {
    expect(
      calculateLineTotal({
        pricingType: "fixed",
        unitPrice: 70,
        pounds: 3,
        quantity: 6,
      }),
    ).toBe(420);
  });

  it("clamps invalid quantities and prices", () => {
    expect(
      calculateLineTotal({
        pricingType: "fixed",
        unitPrice: -100,
        quantity: 0,
      }),
    ).toBe(0);
  });
});

describe("calculateCartTotals", () => {
  it("splits cakes and little treats", () => {
    const items = [
      cartItem({ key: "a", pounds: 2, unitPrice: 1100 }),
      cartItem({ key: "b", pricingType: "fixed", unitPrice: 70, pounds: null, quantity: 6 }),
    ];
    expect(calculateCartTotals(items)).toEqual({
      cakeSubtotal: 2200,
      additionalTotal: 420,
      subtotal: 2620,
    });
  });
});

describe("calculateDeliveryCharge", () => {
  it("charges delivery below the free threshold", () => {
    expect(
      calculateDeliveryCharge({
        deliveryType: "delivery",
        goodsTotal: 1000,
        deliveryCharge: 200,
        freeDeliveryThreshold: 5000,
      }),
    ).toBe(200);
  });

  it("is free at or above the threshold", () => {
    expect(
      calculateDeliveryCharge({
        deliveryType: "delivery",
        goodsTotal: 5000,
        deliveryCharge: 200,
        freeDeliveryThreshold: 5000,
      }),
    ).toBe(0);
  });

  it("is always free for pickup", () => {
    expect(
      calculateDeliveryCharge({
        deliveryType: "pickup",
        goodsTotal: 500,
        deliveryCharge: 200,
        freeDeliveryThreshold: 5000,
      }),
    ).toBe(0);
  });
});

describe("calculateDiscount", () => {
  it("applies a percentage discount", () => {
    expect(
      calculateDiscount({ goodsTotal: 2000, discountType: "percentage", discountValue: 10 }),
    ).toBe(200);
  });

  it("applies a fixed discount capped at the goods total", () => {
    expect(
      calculateDiscount({ goodsTotal: 500, discountType: "fixed", discountValue: 800 }),
    ).toBe(500);
  });

  it("returns zero below the minimum order", () => {
    expect(
      calculateDiscount({
        goodsTotal: 900,
        discountType: "percentage",
        discountValue: 10,
        minimumOrder: 1000,
      }),
    ).toBe(0);
  });

  it("returns zero when no deal is applied", () => {
    expect(
      calculateDiscount({ goodsTotal: 2000, discountType: null, discountValue: 0 }),
    ).toBe(0);
  });
});

describe("calculateOrderTotal", () => {
  it("adds charges and subtracts the discount", () => {
    expect(
      calculateOrderTotal({
        cakeSubtotal: 2200,
        additionalTotal: 420,
        decorationCharge: 300,
        deliveryCharge: 200,
        discount: 200,
      }),
    ).toBe(2920);
  });

  it("never returns a negative total", () => {
    expect(
      calculateOrderTotal({
        cakeSubtotal: 100,
        additionalTotal: 0,
        decorationCharge: 0,
        deliveryCharge: 0,
        discount: 500,
      }),
    ).toBe(0);
  });
});

describe("estimateProfit", () => {
  it("uses Rs 100 per pound by default", () => {
    expect(
      estimateProfit({
        cakeItems: [
          { pounds: 2, quantity: 1 },
          { pounds: 1, quantity: 3 },
        ],
        profitPerPound: 100,
      }),
    ).toBe(500);
  });

  it("ignores fixed items with no pounds", () => {
    expect(
      estimateProfit({ cakeItems: [{ pounds: null, quantity: 10 }], profitPerPound: 100 }),
    ).toBe(0);
  });
});
