import { describe, expect, it } from "vitest";
import {
  contactSchema,
  orderFormSchema,
  orderItemInputSchema,
} from "@/lib/validation";

function futureDate(days = 2) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function validOrder(overrides: Record<string, unknown> = {}) {
  return {
    name: "Ayesha Khan",
    phone: "0300-5477207",
    whatsapp: "0300-5477207",
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

describe("orderItemInputSchema", () => {
  it("accepts a cake with a size and quantity", () => {
    expect(
      orderItemInputSchema.safeParse({
        productId: "prod-chocolate",
        pounds: 2,
        quantity: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects a zero quantity", () => {
    expect(
      orderItemInputSchema.safeParse({
        productId: "prod-chocolate",
        pounds: 2,
        quantity: 0,
      }).success,
    ).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts a complete message", () => {
    expect(
      contactSchema.safeParse({
        name: "Ali",
        email: "ali@example.com",
        phone: "0300-5477207",
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
