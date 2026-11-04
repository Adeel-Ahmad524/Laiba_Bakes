"use server";

import { headers } from "next/headers";
import { submitToFormspree } from "@/lib/formspree";
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

  const subject = parsed.data.subject || "General enquiry";
  const result = await submitToFormspree({
    subject: `Website enquiry: ${subject}`,
    form_type: "contact",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || "",
    enquiry_subject: subject,
    message: parsed.data.message,
    submitted_at: new Date().toISOString(),
  });

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.message ??
        "We could not send your message. Please try again or contact us on WhatsApp.",
    };
  }

  return {
    ok: true,
    message:
      "Thank you for writing to us. Your message has been received — we will be in touch soon.",
  };
}
