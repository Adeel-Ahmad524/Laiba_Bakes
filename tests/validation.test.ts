import { describe, expect, it } from "vitest";
import {
  contactSchema,
  dealSchema,
  lookupSchema,
  orderFormSchema,
  productSchema,
} from "@/lib/validation";

function futureDate(days = 2) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function validOrder(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ayesha Khan",
    phone: "0300-5477201",
    whatsapp: "0300-5477201",
    email: "ayesha@example.com",
    address: "House 12, Civil Lines, Dera Ismail Khan",
    deliveryType: "delivery",
    requiredDate: futureDate(),
    requiredTime: "04:00 PM",
    paymentMethod: "Cash on delivery",
    decorationId: "",
    cakeColour: "Blush and gold",
    cakeMessage: "Happy birthday",
    designDescription: "",
    specialInstructions: "",
    couponCode: "",
    orderType: "standard",
    items: JSON.stringify([{ productId: "product-1", pounds: 2, quantity: 1 }]),
    website: "",
    terms: "on",
    startedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("orderFormSchema", () => {
  it("accepts a complete delivery order", () => {
    const result = orderFormSchema.safeParse(validOrder());
    expect(result.success).toBe(true);
  });

  it("accepts a pickup order without an address", () => {
    const result = orderFormSchema.safeParse(
      validOrder({ deliveryType: "pickup", address: "" }),
    );
    expect(result.success).toBe(true);
  });

  it("requires a delivery address for delivery orders", () => {
    const result = orderFormSchema.safeParse(validOrder({ address: "" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("address"))).toBe(true);
    }
  });

  it("requires a design description for custom orders", () => {
    const result = orderFormSchema.safeParse(
      validOrder({ orderType: "custom", designDescription: "short" }),
    );
    expect(result.success).toBe(false);
  });

  it("requires accepted terms", () => {
    const result = orderFormSchema.safeParse(validOrder({ terms: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects past dates", () => {
    const result = orderFormSchema.safeParse(
      validOrder({ requiredDate: "2020-01-01" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects invalid Pakistani phone numbers", () => {
    const result = orderFormSchema.safeParse(validOrder({ phone: "12345" }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty basket", () => {
    const result = orderFormSchema.safeParse(validOrder({ items: "" }));
    expect(result.success).toBe(false);
  });
});

describe("lookupSchema", () => {
  it("accepts an order id and phone", () => {
    expect(
      lookupSchema.safeParse({ orderId: "LB-261104-ABC123", phone: "0300-5477201" })
        .success,
    ).toBe(true);
  });

  it("rejects a missing order id", () => {
    expect(lookupSchema.safeParse({ orderId: "", phone: "0300-5477201" }).success).toBe(
      false,
    );
  });
});

describe("contactSchema", () => {
  it("accepts a complete message", () => {
    expect(
      contactSchema.safeParse({
        name: "Ali",
        email: "ali@example.com",
        phone: "0300-5477201",
        subject: "Cake enquiry",
        message: "I would like a two pound chocolate cake next week.",
        website: "",
      }).success,
    ).toBe(true);
  });

  it("rejects short messages", () => {
    expect(
      contactSchema.safeParse({
        name: "Ali",
        email: "ali@example.com",
        phone: "",
        subject: "",
        message: "Hi",
        website: "",
      }).success,
    ).toBe(false);
  });
});

describe("admin schemas", () => {
  it("validates a product slug", () => {
    const result = productSchema.safeParse({
      name: "Chocolate Cake",
      slug: "Chocolate Cake",
      description: "",
      categoryId: "",
      flavor: "Chocolate",
      price: "1100",
      pricingType: "per_pound",
      imageUrl: "",
      sortOrder: "0",
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric deal values", () => {
    const result = dealSchema.safeParse({
      title: "Weekend offer",
      slug: "weekend-offer",
      description: "",
      code: "WEEKEND10",
      discountType: "percentage",
      discountValue: "10",
      minimumOrder: "1000",
      imageUrl: "",
      startsAt: "",
      endsAt: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountValue).toBe(10);
      expect(result.data.minimumOrder).toBe(1000);
    }
  });
});
