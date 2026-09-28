import { z } from "zod";
import { normalizeMoroccanPhone } from "@/lib/morocco";

// Shared by the checkout form (client) and the placeOrder action (server).
export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const phone = normalizeMoroccanPhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Enter a Moroccan number, e.g. 06 12 34 56 78 or +212 6 12 34 56 78." });
        return z.NEVER;
      }
      return phone;
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Please enter a valid email address.")
    .optional()
    .default(""),
  city: z.string().trim().min(2, "Please choose your city.").max(60),
  address: z.string().trim().min(5, "Please enter your full delivery address.").max(300, "Address is too long."),
  notes: z.string().trim().max(500, "Notes are too long (500 characters max).").optional().default(""),
  newsletter: z.boolean().optional().default(false),
  discountCode: z.string().trim().max(32).optional().default(""),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        size: z.string().min(1).max(12),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty.")
    .max(50),
  expectedTotal: z.number().nonnegative(),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutFieldErrors = Partial<Record<"fullName" | "phone" | "email" | "city" | "address" | "notes", string>>;
