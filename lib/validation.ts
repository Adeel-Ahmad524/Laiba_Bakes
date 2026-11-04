import { z } from "zod";
import { normalizePhone } from "./utils";

const phoneSchema = z
  .string()
  .trim()
  .min(11, "Please enter a valid Pakistani mobile number.")
  .refine((value) => {
    const normalized = normalizePhone(value);
    return normalized.length === 12 && normalized.startsWith("923");
  }, "Please enter a valid Pakistani mobile number (e.g. 0300-5477201).");

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

export const lookupSchema = z.object({
  orderId: z.string().trim().min(4, "Enter your order ID.").max(40),
  phone: phoneSchema,
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

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  flavor: z.string().trim().max(80).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  pricingType: z.enum(["per_pound", "fixed"]),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  isFeatured: z.string().optional(),
  isActive: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.string().optional(),
});

export const dealSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  code: z.string().trim().max(30).optional().or(z.literal("")),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(0),
  minimumOrder: z.coerce.number().min(0).default(0),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.string().optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(300),
  phone: z.string().trim().min(7).max(30),
  whatsapp: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(120),
  deliveryCharge: z.coerce.number().min(0),
  freeDeliveryThreshold: z.coerce.number().min(0),
  minimumOrder: z.coerce.number().min(0),
  profitPerPound: z.coerce.number().min(0),
  paymentMethods: z.string().trim().min(2),
  openingHours: z.string().trim().max(160).optional().or(z.literal("")),
  announcement: z.string().trim().max(240).optional().or(z.literal("")),
  mapEmbedUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  facebookUrl: z.string().trim().max(300).optional().or(z.literal("")),
});

export const decorationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  charge: z.coerce.number().min(0),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.string().optional(),
});

export function flattenZodErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
