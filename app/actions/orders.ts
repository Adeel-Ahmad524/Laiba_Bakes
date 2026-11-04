"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  getCakeSizes,
  getDeals,
  getDecorations,
  getOrderSettings,
  getProducts,
} from "@/lib/data";
import { submitToFormspree } from "@/lib/formspree";
import {
  calculateDeliveryCharge,
  calculateDiscount,
  calculateLineTotal,
  calculateOrderTotal,
  roundMoney,
} from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone, safeNumber } from "@/lib/utils";
import {
  flattenZodErrors,
  orderFormSchema,
  orderItemInputSchema,
} from "@/lib/validation";
import type {
  CakeSize,
  DecorationOption,
  Product,
} from "@/lib/types";

export interface OrderActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime] ?? null;
}

function hasValidImageSignature(bytes: Uint8Array, mime: string) {
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mime === "image/webp") {
    return (
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
      String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
    );
  }
  return false;
}

async function clientKey(prefix: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for") ?? "local";
  return `${prefix}:${forwarded.split(",")[0]?.trim() ?? "local"}`;
}

function orderNumber() {
  const date = new Date();
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `LB-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

export async function placeOrderAction(
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = orderFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
    deliveryType: formData.get("deliveryType"),
    requiredDate: formData.get("requiredDate"),
    requiredTime: formData.get("requiredTime"),
    paymentMethod: formData.get("paymentMethod"),
    decorationId: formData.get("decorationId") ?? "",
    cakeColour: formData.get("cakeColour") ?? "",
    cakeMessage: formData.get("cakeMessage") ?? "",
    designDescription: formData.get("designDescription") ?? "",
    specialInstructions: formData.get("specialInstructions") ?? "",
    couponCode: formData.get("couponCode") ?? "",
    orderType: formData.get("orderType") ?? "standard",
    items: formData.get("items") ?? "",
    website: formData.get("website") ?? "",
    terms: formData.get("terms"),
    startedAt: formData.get("startedAt") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
      errors: flattenZodErrors(parsed.error),
    };
  }

  const limit = rateLimit(await clientKey("order"), { limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return {
      ok: false,
      message: "Too many attempts. Please wait a minute, then try again.",
    };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(parsed.data.items);
  } catch {
    return {
      ok: false,
      message: "Your basket could not be read. Please refresh and try again.",
    };
  }

  const itemsResult = z
    .array(orderItemInputSchema)
    .min(1, "Your basket is empty.")
    .max(30)
    .safeParse(rawItems);

  if (!itemsResult.success) {
    return {
      ok: false,
      message: "Some basket items are invalid. Please refresh and try again.",
    };
  }

  const [settings, products, sizes, decorations, deals] = await Promise.all([
    getOrderSettings(),
    getProducts(),
    getCakeSizes(),
    getDecorations(),
    getDeals(),
  ]);

  if (!settings.payment_methods.includes(parsed.data.paymentMethod)) {
    return { ok: false, message: "Please choose an available payment method." };
  }

  const allowedPounds = new Set(
    (sizes as CakeSize[]).map((size) => safeNumber(size.pounds)),
  );
  const decoration =
    (decorations as DecorationOption[]).find(
      (option) => option.id === parsed.data.decorationId,
    ) ?? null;

  if (parsed.data.decorationId && !decoration) {
    return { ok: false, message: "The selected decoration option is unavailable." };
  }

  const mergedItems = new Map<
    string,
    { product: Product; pounds: number | null; quantity: number }
  >();

  for (const item of itemsResult.data) {
    const product = (products as Product[]).find(
      (entry) => entry.id === item.productId,
    );
    if (!product) {
      return {
        ok: false,
        message: "One of your items is no longer available. Please update your basket.",
      };
    }

    let pounds: number | null = null;
    if (product.pricing_type === "per_pound") {
      pounds = safeNumber(item.pounds);
      if (!allowedPounds.has(pounds)) {
        return {
          ok: false,
          message: `Please choose an available size for ${product.name}.`,
        };
      }
    }

    const key = `${product.id}:${pounds ?? "fixed"}`;
    const existing = mergedItems.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      mergedItems.set(key, { product, pounds, quantity: item.quantity });
    }
  }

  const orderLines = Array.from(mergedItems.values()).map((item) => ({
    ...item,
    lineTotal: calculateLineTotal({
      pricingType: item.product.pricing_type,
      unitPrice: safeNumber(item.product.price),
      pounds: item.pounds,
      quantity: item.quantity,
    }),
  }));

  const cakeItems = orderLines.filter(
    (item) => item.product.pricing_type === "per_pound",
  );
  const extraItems = orderLines.filter(
    (item) => item.product.pricing_type === "fixed",
  );
  const cakeSubtotal = roundMoney(
    cakeItems.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const additionalTotal = roundMoney(
    extraItems.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const goodsTotal = roundMoney(cakeSubtotal + additionalTotal);
  const decorationCharge = roundMoney(safeNumber(decoration?.charge));

  if (goodsTotal < safeNumber(settings.minimum_order)) {
    return {
      ok: false,
      message: `The minimum order is ${money(safeNumber(settings.minimum_order))}. Please add a little more to your basket.`,
    };
  }

  const deliveryCharge = calculateDeliveryCharge({
    deliveryType: parsed.data.deliveryType,
    goodsTotal,
    deliveryCharge: safeNumber(settings.delivery_charge),
    freeDeliveryThreshold: safeNumber(settings.free_delivery_threshold),
  });

  let discount = 0;
  if (parsed.data.couponCode) {
    const code = parsed.data.couponCode.toUpperCase();
    const deal = (deals as typeof deals).find(
      (entry) => entry.code?.toUpperCase() === code,
    );

    if (!deal) {
      return {
        ok: false,
        errors: { couponCode: "This coupon code is not valid." },
        message: "The coupon code could not be applied.",
      };
    }

    discount = calculateDiscount({
      goodsTotal,
      discountType: deal.discount_type,
      discountValue: safeNumber(deal.discount_value),
      minimumOrder: safeNumber(deal.minimum_order),
    });

    if (discount <= 0) {
      return {
        ok: false,
        errors: {
          couponCode: `This code needs a minimum order of ${money(safeNumber(deal.minimum_order))}.`,
        },
        message: "The coupon requirements are not met.",
      };
    }
  }

  const total = calculateOrderTotal({
    cakeSubtotal,
    additionalTotal,
    decorationCharge,
    deliveryCharge,
    discount,
  });

  const normalizedPhone = normalizePhone(parsed.data.phone);
  const normalizedWhatsapp = normalizePhone(parsed.data.whatsapp);
  const generatedOrderNumber = orderNumber();

  let referenceFile: File | null = null;
  const fileEntry = formData.get("referenceImage");
  if (fileEntry instanceof File && fileEntry.size > 0) {
    if (fileEntry.size > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        errors: { referenceImage: "Please upload an image smaller than 5 MB." },
        message: "Your reference image is too large.",
      };
    }

    const extension = extensionForMime(fileEntry.type);
    const bytes = new Uint8Array(await fileEntry.arrayBuffer());
    if (!extension || !hasValidImageSignature(bytes, fileEntry.type)) {
      return {
        ok: false,
        errors: { referenceImage: "Upload a JPG, PNG or WebP image." },
        message: "Please upload a valid image file.",
      };
    }

    referenceFile = fileEntry;
  }

  const itemLines = orderLines.map((item) => {
    const size = item.pounds ? ` (${item.pounds} lb)` : "";
    return `${item.product.name}${size} × ${item.quantity} = ${money(item.lineTotal)}`;
  });

  const fields: Record<string, string> = {
    subject: `New order ${generatedOrderNumber} — ${parsed.data.name}`,
    form_type: "order",
    order_number: generatedOrderNumber,
    order_type: parsed.data.orderType,
    name: parsed.data.name,
    phone: parsed.data.phone,
    phone_normalized: normalizedPhone,
    whatsapp: parsed.data.whatsapp,
    whatsapp_normalized: normalizedWhatsapp,
    delivery_type: parsed.data.deliveryType,
    address: parsed.data.address || "",
    required_date: parsed.data.requiredDate,
    required_time: parsed.data.requiredTime,
    payment_method: parsed.data.paymentMethod,
    items: itemLines.join("\n"),
    item_count: String(
      orderLines.reduce((sum, item) => sum + item.quantity, 0),
    ),
    cakes_subtotal: money(cakeSubtotal),
    little_treats_total: money(additionalTotal),
    decoration: decoration?.name ?? "None",
    decoration_charge: money(decorationCharge),
    delivery_charge: money(deliveryCharge),
    discount: money(discount),
    coupon_code: parsed.data.couponCode ? parsed.data.couponCode.toUpperCase() : "",
    total: money(total),
    cake_colour: parsed.data.cakeColour || "",
    cake_message: parsed.data.cakeMessage || "",
    design_description: parsed.data.designDescription || "",
    special_instructions: parsed.data.specialInstructions || "",
    submitted_at: new Date().toISOString(),
  };

  if (parsed.data.email) {
    fields.email = parsed.data.email;
  }

  const submission = await submitToFormspree(
    fields,
    referenceFile
      ? { fieldName: "attachment", file: referenceFile }
      : null,
  );

  if (!submission.ok) {
    return {
      ok: false,
      message:
        submission.message ??
        "We could not send your order. Please try again, or contact us on WhatsApp.",
    };
  }

  const successParams = new URLSearchParams({
    order: generatedOrderNumber,
    name: parsed.data.name,
    total: String(total),
    date: parsed.data.requiredDate,
    time: parsed.data.requiredTime,
    delivery: parsed.data.deliveryType,
    payment: parsed.data.paymentMethod,
    items: String(
      orderLines.reduce((sum, item) => sum + item.quantity, 0),
    ),
    ref: referenceFile
      ? submission.fileSkipped
        ? "skipped"
        : "attached"
      : "none",
  });

  redirect(`/order/success?${successParams.toString()}`);
}
