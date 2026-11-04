"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uploadProductImage } from "@/lib/uploads";
import {
  categorySchema,
  dealSchema,
  decorationSchema,
  flattenZodErrors,
  productSchema,
  settingsSchema,
} from "@/lib/validation";
import { z } from "zod";

export interface AdminFormState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

function refreshStorefront() {
  revalidatePath("/", "layout");
}

export async function saveProductAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    flavor: formData.get("flavor") ?? "",
    price: formData.get("price"),
    pricingType: formData.get("pricingType"),
    imageUrl: formData.get("imageUrl") ?? "",
    isFeatured: formData.get("isFeatured") ?? undefined,
    isActive: formData.get("isActive") ?? undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the product details.",
      errors: flattenZodErrors(parsed.error),
    };
  }

  let imageUrl = parsed.data.imageUrl || null;
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadProductImage(file, parsed.data.slug);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Image upload failed.",
        errors: { imageFile: "Image upload failed." },
      };
    }
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    category_id: parsed.data.categoryId || null,
    flavor: parsed.data.flavor || null,
    price: parsed.data.price,
    pricing_type: parsed.data.pricingType,
    image_url: imageUrl,
    is_featured: parsed.data.isFeatured === "on",
    is_active: parsed.data.isActive === "on",
    sort_order: parsed.data.sortOrder,
  };

  const { error } = id
    ? await admin.from("products").update(payload).eq("id", id)
    : await admin.from("products").insert(payload);

  if (error) {
    const duplicate = error.code === "23505";
    return {
      ok: false,
      message: duplicate
        ? "That product URL slug is already in use."
        : "The product could not be saved. Please try again.",
      errors: duplicate ? { slug: "This slug is already in use." } : undefined,
    };
  }

  refreshStorefront();
  redirect(`/admin/products?saved=${id ? "updated" : "created"}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const admin = createSupabaseAdminClient();
    await admin.from("products").delete().eq("id", id);
  }
  refreshStorefront();
  redirect("/admin/products?deleted=1");
}

export async function saveCategoryAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") ?? undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the category details.",
      errors: flattenZodErrors(parsed.error),
    };
  }

  let imageUrl = parsed.data.imageUrl || null;
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadProductImage(file, `category-${parsed.data.slug}`);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Image upload failed.",
        errors: { imageFile: "Image upload failed." },
      };
    }
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    image_url: imageUrl,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive === "on",
  };

  const { error } = id
    ? await admin.from("categories").update(payload).eq("id", id)
    : await admin.from("categories").insert(payload);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "That category URL slug is already in use."
          : "The category could not be saved.",
      errors: error.code === "23505" ? { slug: "This slug is already in use." } : undefined,
    };
  }

  refreshStorefront();
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const admin = createSupabaseAdminClient();
    await admin.from("categories").delete().eq("id", id);
  }
  refreshStorefront();
  redirect("/admin/categories?deleted=1");
}

export async function saveDealAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const parsed = dealSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    code: formData.get("code") ?? "",
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minimumOrder: formData.get("minimumOrder") ?? 0,
    imageUrl: formData.get("imageUrl") ?? "",
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
    isActive: formData.get("isActive") ?? undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the offer details.",
      errors: flattenZodErrors(parsed.error),
    };
  }

  if (
    parsed.data.discountType === "percentage" &&
    parsed.data.discountValue > 100
  ) {
    return {
      ok: false,
      message: "Percentage discounts cannot exceed 100%.",
      errors: { discountValue: "Enter a value of 100 or less." },
    };
  }

  let imageUrl = parsed.data.imageUrl || null;
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadProductImage(file, `deal-${parsed.data.slug}`);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Image upload failed.",
        errors: { imageFile: "Image upload failed." },
      };
    }
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    code: parsed.data.code ? parsed.data.code.toUpperCase() : null,
    discount_type: parsed.data.discountType,
    discount_value: parsed.data.discountValue,
    minimum_order: parsed.data.minimumOrder,
    image_url: imageUrl,
    starts_at: parsed.data.startsAt
      ? new Date(`${parsed.data.startsAt}T00:00:00`).toISOString()
      : null,
    ends_at: parsed.data.endsAt
      ? new Date(`${parsed.data.endsAt}T23:59:59`).toISOString()
      : null,
    is_active: parsed.data.isActive === "on",
  };

  const { error } = id
    ? await admin.from("deals").update(payload).eq("id", id)
    : await admin.from("deals").insert(payload);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "That deal slug or coupon code is already in use."
          : "The deal could not be saved.",
      errors:
        error.code === "23505"
          ? { slug: "The slug or coupon code is already in use." }
          : undefined,
    };
  }

  refreshStorefront();
  redirect("/admin/deals?saved=1");
}

export async function deleteDealAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const admin = createSupabaseAdminClient();
    await admin.from("deals").delete().eq("id", id);
  }
  refreshStorefront();
  redirect("/admin/deals?deleted=1");
}

export async function saveSettingsAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    businessName: formData.get("businessName"),
    tagline: formData.get("tagline") ?? "",
    address: formData.get("address"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    deliveryCharge: formData.get("deliveryCharge"),
    freeDeliveryThreshold: formData.get("freeDeliveryThreshold"),
    minimumOrder: formData.get("minimumOrder"),
    profitPerPound: formData.get("profitPerPound"),
    paymentMethods: formData.get("paymentMethods"),
    openingHours: formData.get("openingHours") ?? "",
    announcement: formData.get("announcement") ?? "",
    mapEmbedUrl: formData.get("mapEmbedUrl") ?? "",
    instagramUrl: formData.get("instagramUrl") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the business settings.",
      errors: flattenZodErrors(parsed.error),
    };
  }

  const methods = parsed.data.paymentMethods
    .split(/[\n,]+/)
    .map((method) => method.trim())
    .filter(Boolean);

  if (methods.length === 0) {
    return {
      ok: false,
      message: "Add at least one payment method.",
      errors: { paymentMethods: "Add at least one payment method." },
    };
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    business_name: parsed.data.businessName,
    tagline: parsed.data.tagline || null,
    address: parsed.data.address,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp,
    email: parsed.data.email,
    delivery_charge: parsed.data.deliveryCharge,
    free_delivery_threshold: parsed.data.freeDeliveryThreshold,
    minimum_order: parsed.data.minimumOrder,
    profit_per_pound: parsed.data.profitPerPound,
    payment_methods: methods,
    opening_hours: parsed.data.openingHours || null,
    announcement: parsed.data.announcement || null,
    map_embed_url: parsed.data.mapEmbedUrl || null,
    instagram_url: parsed.data.instagramUrl || null,
    facebook_url: parsed.data.facebookUrl || null,
  };

  const { data: existing } = await admin
    .from("business_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const { error } = existing
    ? await admin.from("business_settings").update(payload).eq("id", existing.id)
    : await admin.from("business_settings").insert(payload);

  if (error) {
    return {
      ok: false,
      message: "The settings could not be saved. Please try again.",
    };
  }

  refreshStorefront();
  redirect("/admin/settings?saved=1");
}

export async function saveDecorationAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const parsed = decorationSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    charge: formData.get("charge"),
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") ?? undefined,
  });

  if (!parsed.success) {
    redirect("/admin/settings?error=decoration");
  }

  const admin = createSupabaseAdminClient();
  const payload = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    charge: parsed.data.charge,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive === "on",
  };
  const { error } = id
    ? await admin.from("decoration_options").update(payload).eq("id", id)
    : await admin.from("decoration_options").insert(payload);

  if (error) redirect("/admin/settings?error=decoration");
  refreshStorefront();
  redirect("/admin/settings?saved=decoration");
}

export async function deleteDecorationAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const admin = createSupabaseAdminClient();
    await admin.from("decoration_options").delete().eq("id", id);
  }
  refreshStorefront();
  redirect("/admin/settings?saved=decoration");
}

const cakeSizeSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(2).max(40),
  pounds: z.coerce.number().positive().max(100),
  referencePrice: z.coerce.number().min(0),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.string().optional(),
});

export async function saveCakeSizeAction(formData: FormData) {
  await requireAdmin();
  const parsed = cakeSizeSchema.safeParse({
    id: formData.get("id") ?? "",
    label: formData.get("label"),
    pounds: formData.get("pounds"),
    referencePrice: formData.get("referencePrice"),
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") ?? undefined,
  });

  if (!parsed.success) redirect("/admin/settings?error=size");

  const admin = createSupabaseAdminClient();
  const payload = {
    label: parsed.data.label,
    pounds: parsed.data.pounds,
    reference_price: parsed.data.referencePrice,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive === "on",
  };
  const { error } = parsed.data.id
    ? await admin.from("cake_sizes").update(payload).eq("id", parsed.data.id)
    : await admin.from("cake_sizes").insert(payload);

  if (error) redirect("/admin/settings?error=size");
  refreshStorefront();
  redirect("/admin/settings?saved=size");
}

export async function deleteCakeSizeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const admin = createSupabaseAdminClient();
    await admin.from("cake_sizes").delete().eq("id", id);
  }
  refreshStorefront();
  redirect("/admin/settings?saved=size");
}

const orderUpdateSchema = z.object({
  status: z.enum([
    "new",
    "confirmed",
    "preparing",
    "ready_for_pickup",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]),
  internalNotes: z.string().trim().max(3000).optional().or(z.literal("")),
});

export async function updateOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = orderUpdateSchema.safeParse({
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    internalNotes: formData.get("internalNotes") ?? "",
  });

  if (!id || !parsed.success) {
    redirect(`/admin/orders/${id || ""}?error=1`);
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({
      status: parsed.data.status,
      payment_status: parsed.data.paymentStatus,
      internal_notes: parsed.data.internalNotes || null,
    })
    .eq("id", id);

  if (error) redirect(`/admin/orders/${id}?error=1`);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect(`/admin/orders/${id}?updated=1`);
}

export async function updateMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "read");
  if (id && ["new", "read", "replied"].includes(status)) {
    const admin = createSupabaseAdminClient();
    await admin.from("contact_messages").update({ status }).eq("id", id);
  }
  revalidatePath("/admin/messages");
  redirect("/admin/messages?updated=1");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const admin = createSupabaseAdminClient();
    await admin.from("contact_messages").delete().eq("id", id);
  }
  revalidatePath("/admin/messages");
  redirect("/admin/messages?deleted=1");
}
