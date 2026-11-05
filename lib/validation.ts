import { z } from "zod";
import { normalizePhone } from "./utils";

const phoneSchema = z
  .string()
  .trim()
  .min(11, "Please enter a valid Pakistani mobile number.")
  .refine((value) => {
    const normalized = normalizePhone(value);
    return normalized.length === 12 && normalized.startsWith("923");
  }, "Please enter a valid Pakistani mobile number (e.g. 0300-5477207).");

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  pounds: z.coerce.number().positive().max(20).nullable().optional(),
  quantity: z.coerce.number().int().min(1).max(50),
});

export const orderFormSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name.").max(80),
    phone: phoneSchema,
    whatsapp: phoneSchema,
    email: z
      .string()
      .trim()
      .max(120)
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Please enter a valid email address.",
      ),
    address: z.string().trim().max(400).optional().or(z.literal("")),
    deliveryType: z.enum(["delivery", "pickup"]),
    requiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a required date."),
    requiredTime: z.string().trim().min(1, "Choose a required time.").max(20),
    paymentMethod: z.string().trim().min(1, "Choose a payment method."),
    decorationId: z.string().trim().optional().or(z.literal("")),
    cakeColour: z.string().trim().max(80).optional().or(z.literal("")),
    cakeMessage: z.string().trim().max(140).optional().or(z.literal("")),
    designDescription: z.string().trim().max(2000).optional().or(z.literal("")),
    specialInstructions: z
      .string()
      .trim()
      .max(1500)
      .optional()
      .or(z.literal("")),
    couponCode: z.string().trim().max(40).optional().or(z.literal("")),
    orderType: z.enum(["standard", "custom"]).default("standard"),
    items: z.string().min(2, "Your basket is empty."),
    website: z.string().max(0).optional().or(z.literal("")),
    terms: z.literal("on", {
      errorMap: () => ({ message: "Please accept the order terms." }),
    }),
    startedAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "delivery" && (!data.address || data.address.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Please enter a complete delivery address.",
      });
    }
    if (data.orderType === "custom" && (!data.designDescription || data.designDescription.length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["designDescription"],
        message: "Please describe your custom cake design (at least 10 characters).",
      });
    }
    const date = new Date(`${data.requiredDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(date.getTime()) || date < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiredDate"],
        message: "Please choose today or a future date.",
      });
    }
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || normalizePhone(value).length >= 10,
      "Please enter a valid phone number.",
    ),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please tell us a little more.").max(3000),
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.string().optional(),
});

export function flattenZodErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
