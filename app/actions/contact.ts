"use server";

import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, flattenZodErrors } from "@/lib/validation";

export interface ContactActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function submitContactAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  if (!isSupabaseAdminConfigured) {
    return {
      ok: false,
      message:
        "The contact form is being set up. Please call or WhatsApp us in the meantime.",
    };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    website: formData.get("website") ?? "",
    startedAt: formData.get("startedAt") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the form and try again.",
      errors: flattenZodErrors(parsed.error),
    };
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for") ?? "local";
  const key = `contact:${forwarded.split(",")[0]?.trim() ?? "local"}`;
  if (!rateLimit(key, { limit: 5, windowMs: 60_000 }).allowed) {
    return {
      ok: false,
      message: "Too many messages. Please wait a minute and try again.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || "Website enquiry",
    message: parsed.data.message,
    status: "new",
  });

  if (error) {
    console.error("Contact message save failed:", error);
    return {
      ok: false,
      message:
        "We could not send your message. Please try again or contact us on WhatsApp.",
    };
  }

  return {
    ok: true,
    message:
      "Thank you for writing to us. Your message has been received — we will be in touch soon.",
  };
}
