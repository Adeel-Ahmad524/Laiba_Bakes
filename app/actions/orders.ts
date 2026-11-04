"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getSettings } from "@/lib/data";
import {
  calculateDeliveryCharge,
  calculateDiscount,
  calculateLineTotal,
  calculateOrderTotal,
  estimateProfit,
  roundMoney,
} from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone, safeNumber, todayISO } from "@/lib/utils";
import {
  flattenZodErrors,
  lookupSchema,
  orderFormSchema,
  orderItemInputSchema,
} from "@/lib/validation";
import type {
  CakeSize,
  DecorationOption,
  Order,
  PaymentStatus,
  Product,
  PublicOrder,
} from "@/lib/types";

export interface OrderActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export interface LookupActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  order?: PublicOrder;
}

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

export async function placeOrderAction(
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  if (!isSupabaseAdminConfigured) {
    return {
      ok: false,
      message:
        "Online ordering is being set up. Please contact us on WhatsApp to place your order.",
    };
  }

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
    return { ok: false, message: "Your basket could not be read. Please refresh and try again." };
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

  const admin = createSupabaseAdminClient();
  const settings = await getSettings();

  if (!settings.payment_methods.includes(parsed.data.paymentMethod)) {
    return { ok: false, message: "Please choose an available payment method." };
  }

  const [{ data: productRows, error: productError }, { data: sizeRows }, { data: decorationRows }] =
    await Promise.all([
      admin
        .from("products")
        .select("*")
        .in("id", itemsResult.data.map((item) => item.productId))
        .eq("is_active", true),
      admin.from("cake_sizes").select("*").eq("is_active", true),
      admin.from("decoration_options").select("*").eq("is_active", true),
    ]);

  if (productError) {
    return { ok: false, message: "We could not load the menu. Please try again." };
  }

  const products = (productRows ?? []) as Product[];
  const allowedPounds = new Set(
    ((sizeRows ?? []) as CakeSize[]).map((size) => safeNumber(size.pounds)),
  );
  const decorations = (decorationRows ?? []) as DecorationOption[];
  const decoration =
    decorations.find((option) => option.id === parsed.data.decorationId) ?? null;

  if (parsed.data.decorationId && !decoration) {
    return { ok: false, message: "The selected decoration option is unavailable." };
  }

  const mergedItems = new Map<
    string,
    { product: Product; pounds: number | null; quantity: number }
  >();

  for (const item of itemsResult.data) {
    const product = products.find((entry) => entry.id === item.productId);
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

  const cakeItems = orderLines.filter((item) => item.product.pricing_type === "per_pound");
  const extraItems = orderLines.filter((item) => item.product.pricing_type === "fixed");
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
      message: `The minimum order is Rs. ${safeNumber(settings.minimum_order).toLocaleString("en-PK")}. Please add a little more to your basket.`,
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
    const { data: deal } = await admin
      .from("deals")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (!deal) {
      return {
        ok: false,
        errors: { couponCode: "This coupon code is not valid." },
        message: "The coupon code could not be applied.",
      };
    }

    const now = Date.now();
    const notStarted = deal.starts_at && new Date(deal.starts_at).getTime() > now;
    const expired = deal.ends_at && new Date(deal.ends_at).getTime() < now;
    if (notStarted || expired) {
      return {
        ok: false,
        errors: { couponCode: "This coupon has expired." },
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
          couponCode: `This code needs a minimum order of Rs. ${safeNumber(deal.minimum_order).toLocaleString("en-PK")}.`,
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
  const estimatedProfit = estimateProfit({
    cakeItems: orderLines
      .filter((item) => item.product.pricing_type === "per_pound")
      .map((item) => ({ pounds: item.pounds, quantity: item.quantity })),
    profitPerPound: safeNumber(settings.profit_per_pound),
  });

  const normalizedPhone = normalizePhone(parsed.data.phone);
  const normalizedWhatsapp = normalizePhone(parsed.data.whatsapp);
  const generatedOrderNumber = orderNumber();

  let referencePath: string | null = null;
  const fileEntry = formData.get("referenceImage");
  if (fileEntry instanceof File && fileEntry.size > 0) {
    if (fileEntry.size > 5 * 1024 * 1024) {
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

    referencePath = `${generatedOrderNumber}/reference-${Date.now()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("cake-references")
      .upload(referencePath, bytes, {
        contentType: fileEntry.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Reference image upload failed:", uploadError);
      return {
        ok: false,
        errors: { referenceImage: "The image could not be uploaded." },
        message:
          "We could not upload your reference image. Please try again or send it on WhatsApp.",
      };
    }
  }

  const { data: customer, error: customerError } = await admin
    .from("customers")
    .upsert(
      {
        name: parsed.data.name,
        phone: normalizedPhone,
        whatsapp: normalizedWhatsapp,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
      },
      { onConflict: "phone" },
    )
    .select("id")
    .single();

  if (customerError || !customer) {
    console.error("Customer save failed:", customerError);
    if (referencePath) {
      await admin.storage.from("cake-references").remove([referencePath]);
    }
    return { ok: false, message: "We could not save your details. Please try again." };
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: generatedOrderNumber,
      customer_id: customer.id,
      order_type: parsed.data.orderType,
      status: "new",
      payment_method: parsed.data.paymentMethod,
      payment_status: "unpaid",
      delivery_type: parsed.data.deliveryType,
      required_date: parsed.data.requiredDate,
      required_time: parsed.data.requiredTime,
      subtotal: cakeSubtotal,
      decoration_charge: decorationCharge,
      additional_total: additionalTotal,
      delivery_charge: deliveryCharge,
      discount,
      total,
      estimated_profit: estimatedProfit,
      customer_notes: parsed.data.specialInstructions || null,
      cake_message: parsed.data.cakeMessage || null,
      cake_colour: parsed.data.cakeColour || null,
      decoration_style: decoration?.name ?? null,
      design_description: parsed.data.designDescription || null,
      reference_image_path: referencePath,
      whatsapp_opened: false,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    console.error("Order save failed:", orderError);
    if (referencePath) {
      await admin.storage.from("cake-references").remove([referencePath]);
    }
    return {
      ok: false,
      message:
        "We could not save your order. Please try again, or contact us on WhatsApp.",
    };
  }

  const savedOrder = order as Order;

  const { error: itemsError } = await admin.from("order_items").insert(
    orderLines.map((item) => ({
      order_id: savedOrder.id,
      product_id: item.product.id,
      product_name: item.product.name,
      pricing_type: item.product.pricing_type,
      unit_price: safeNumber(item.product.price),
      pounds: item.pounds,
      quantity: item.quantity,
      line_total: item.lineTotal,
      options: { flavour: item.product.flavor ?? null },
    })),
  );

  const { error: customError } = await admin.from("customizations").insert({
    order_id: savedOrder.id,
    cake_type: cakeItems.map((item) => item.product.name).join(", ") || null,
    flavour: cakeItems
      .map((item) => item.product.flavor)
      .filter(Boolean)
      .join(", ") || null,
    weight: cakeItems
      .map((item) => (item.pounds ? `${item.pounds} lb` : null))
      .filter(Boolean)
      .join(", ") || null,
    quantity: cakeItems.reduce((sum, item) => sum + item.quantity, 0) || null,
    decoration: decoration?.name ?? null,
    colour: parsed.data.cakeColour || null,
    message: parsed.data.cakeMessage || null,
    special_instructions: parsed.data.specialInstructions || null,
    design_description: parsed.data.designDescription || null,
    reference_image_path: referencePath,
  });

  if (itemsError || customError) {
    console.error("Order details save failed:", itemsError, customError);
    await admin.from("orders").delete().eq("id", savedOrder.id);
    if (referencePath) {
      await admin.storage.from("cake-references").remove([referencePath]);
    }
    return {
      ok: false,
      message: "We could not save all order details. Please try again.",
    };
  }

  redirect(`/order/success?token=${savedOrder.lookup_token}`);
}

export async function lookupOrderAction(
  _prevState: LookupActionState,
  formData: FormData,
): Promise<LookupActionState> {
  if (!isSupabaseAdminConfigured) {
    return {
      ok: false,
      message: "Order tracking is being set up. Please contact us on WhatsApp.",
    };
  }

  const parsed = lookupSchema.safeParse({
    orderId: formData.get("orderId"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { ok: false, errors: flattenZodErrors(parsed.error) };
  }

  const limit = rateLimit(await clientKey("lookup"), { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return {
      ok: false,
      message: "Too many lookups. Please wait a minute and try again.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, customer:customers(*), order_items(*)")
    .eq("order_number", parsed.data.orderId.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message:
        "We could not find an order with those details. Check your order ID and phone number.",
    };
  }

  const customerPhone = normalizePhone(data.customer?.phone ?? "");
  if (customerPhone !== normalizePhone(parsed.data.phone)) {
    return {
      ok: false,
      message:
        "We could not find an order with those details. Check your order ID and phone number.",
    };
  }

  const order = data as Order;
  const publicOrder: PublicOrder = {
    order_number: order.order_number,
    status: order.status,
    payment_method: order.payment_method,
    payment_status: order.payment_status as PaymentStatus,
    delivery_type: order.delivery_type,
    required_date: order.required_date,
    required_time: order.required_time,
    subtotal: safeNumber(order.subtotal),
    decoration_charge: safeNumber(order.decoration_charge),
    additional_total: safeNumber(order.additional_total),
    delivery_charge: safeNumber(order.delivery_charge),
    discount: safeNumber(order.discount),
    total: safeNumber(order.total),
    cake_message: order.cake_message,
    design_description: order.design_description,
    created_at: order.created_at,
    items: (order.order_items ?? []).map((item) => ({
      product_name: item.product_name,
      pounds: item.pounds,
      quantity: item.quantity,
      line_total: safeNumber(item.line_total),
    })),
    customer_name: order.customer?.name ?? "",
  };

  return { ok: true, order: publicOrder };
}

export async function getOrderByToken(token: string) {
  if (!isSupabaseAdminConfigured || !token) return null;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, customer:customers(*), order_items(*)")
    .eq("lookup_token", token)
    .maybeSingle();
  if (error || !data) return null;
  return data as Order;
}

export async function markWhatsAppOpened(orderId: string) {
  if (!isSupabaseAdminConfigured || !orderId) return;
  const admin = createSupabaseAdminClient();
  await admin.from("orders").update({ whatsapp_opened: true }).eq("id", orderId);
}

export async function getTodayDateForClient() {
  return todayISO();
}
