"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, type ActionState } from "@/lib/admin/auth";
import { sendOrderEmail } from "@/lib/emails/send";
import { CATALOG_TAG } from "@/lib/store";
import { createSessionClient } from "@/lib/supabase/server";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"] as const;
const BUCKET = "product-images";

function catalogChanged(productId?: string) {
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

const fail = (message: string): ActionState => ({ ok: false, message });
const done = (message: string): ActionState => ({ ok: true, message });

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!email || !password) return fail("Enter your email and password.");

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Log the reason (never the password) so real problems aren't hidden behind a generic message.
    console.warn(`[admin] sign-in failed for ${email}: ${error.code ?? error.status} ${error.message}`);
    switch (error.code) {
      case "invalid_credentials":
        return fail("Incorrect email or password.");
      case "email_not_confirmed":
        return fail("This email address is not confirmed yet. Run npm run admin:create to confirm it.");
      case "over_request_rate_limit":
      case "over_email_send_rate_limit":
        return fail("Too many attempts. Wait a minute and try again.");
      case "user_banned":
        return fail("This account is blocked.");
      default:
        return fail(`Sign-in failed: ${error.message}`);
    }
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return fail("This account does not have admin access.");
  }
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
/**
 * Saves the shipment details, then the status. Carrier/tracking are saved first so the
 * "on its way" email (sent automatically when the status becomes Shipped) includes them.
 */
export async function updateOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const orderId = z.uuid().safeParse(formData.get("orderId"));
  const status = z.enum(ORDER_STATUSES).safeParse(formData.get("status"));
  if (!orderId.success) return fail("Invalid order.");

  const carrier = String(formData.get("carrier") ?? "").trim().slice(0, 80) || null;
  const tracking = String(formData.get("tracking") ?? "").trim().slice(0, 120) || null;
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim().slice(0, 500) || null;
  if (trackingUrl && !/^https?:\/\/\S+$/.test(trackingUrl)) return fail("The tracking link must start with https://");

  const { data: existing } = await supabase.from("shipments").select("id").eq("order_id", orderId.data).maybeSingle();
  if (existing || carrier || tracking || trackingUrl) {
    const { error } = await supabase
      .from("shipments")
      .upsert(
        { order_id: orderId.data, carrier, tracking_number: tracking, tracking_url: trackingUrl },
        { onConflict: "order_id" },
      );
    if (error) return fail(`Could not save the shipment details: ${error.message}`);
  }

  const messages = ["Saved."];
  if (status.success) {
    const { data: before } = await supabase.from("orders").select("status").eq("id", orderId.data).single();
    if (before && before.status !== status.data) {
      const { error } = await supabase.rpc("set_order_status", { p_order_id: orderId.data, p_status: status.data });
      if (error) {
        if (error.message.includes("ORDER_CLOSED")) {
          return fail("This order was cancelled or returned and its stock was put back. It can't be reopened; create a new order instead.");
        }
        return fail(`Could not update the status: ${error.message}`);
      }
      messages.push(`Status set to ${status.data}.`);
      if (status.data === "cancelled" || status.data === "returned") {
        updateTag(CATALOG_TAG);
        messages.push("The items were put back in stock.");
      }
      if (status.data === "cancelled") {
        const reason = String(formData.get("cancellationReason") ?? "").trim().slice(0, 500) || null;
        if (reason) {
          const { error: reasonError } = await supabase.from("orders").update({ cancellation_reason: reason }).eq("id", orderId.data);
          if (reasonError) console.warn(`[admin] could not save cancellation reason: ${reasonError.message}`);
        }
        // Off by default so test orders stay silent; sent at most once per order.
        if (formData.get("notifyCancelled") === "on") {
          const result = await sendOrderEmail(orderId.data, "cancelled");
          messages.push(
            result === "sent"
              ? "The customer was emailed about the cancellation."
              : result === "already-sent"
                ? "The cancellation email was already sent earlier."
                : result === "skipped"
                  ? "No cancellation email: the customer gave no email address."
                  : "The cancellation email could not be sent (see Emails below).",
          );
        }
      }
      if (status.data === "shipped") {
        // Sent at most once per order (enforced in the database); never blocks this save.
        const result = await sendOrderEmail(orderId.data, "shipped");
        messages.push(
          result === "sent"
            ? "The customer was emailed that the order is on its way."
            : result === "already-sent"
              ? "The \"on its way\" email was already sent earlier."
              : result === "skipped"
                ? "No shipping email: the customer gave no email address."
                : "The shipping email could not be sent (see Emails below).",
        );
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId.data}`);
  return done(messages.join(" "));
}

export async function retryOrderEmail(formData: FormData) {
  await requireAdmin();
  const orderId = z.uuid().parse(formData.get("orderId"));
  const kind = z.enum(["confirmation", "admin_notification", "shipped", "cancelled"]).parse(formData.get("kind"));
  await sendOrderEmail(orderId, kind);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? null : Number(v)), schema.nullable());

const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only (e.g. oversized-fit-black)."),
  name: z.string().trim().min(1, "Name is required.").max(120),
  fit: z.string().trim().max(120),
  color: z.string().trim().max(80),
  description: z.string().trim().max(4000),
  price: z.coerce.number({ message: "Enter a price." }).min(0, "Price can't be negative."),
  rating: optionalNumber(z.number().min(0).max(5)),
  category_id: z.union([z.uuid(), z.literal("")]),
  sort_order: z.coerce.number().int().default(0),
});

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");

  const row = {
    ...parsed.data,
    description: parsed.data.description || null,
    category_id: parsed.data.category_id || null,
    is_new: formData.get("is_new") === "on",
    is_active: formData.get("is_active") === "on",
  };

  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return fail(error.code === "23505" ? "Another product already uses this URL slug." : error.message);
    catalogChanged(id);
    revalidatePath(`/products/${row.slug}`);
    return done("Product saved.");
  }

  const { data, error } = await supabase.from("products").insert(row).select("id").single();
  if (error) return fail(error.code === "23505" ? "Another product already uses this URL slug." : error.message);
  catalogChanged();
  redirect(`/admin/products/${data.id}?created=1`);
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const { data: images } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
  const paths = (images ?? []).map((i) => i.storage_path).filter((p): p is string => Boolean(p));
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  catalogChanged();
  redirect("/admin/products");
}

// ---------------------------------------------------------------------------
// Sizes / stock
// ---------------------------------------------------------------------------
export async function saveVariants(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const productId = z.uuid().parse(formData.get("productId"));
  const ids = formData.getAll("variantId").map(String);

  for (const [i, id] of ids.entries()) {
    const stock = Number(formData.get(`stock_${id}`));
    const sku = String(formData.get(`sku_${id}`) ?? "").trim();
    if (!Number.isInteger(stock) || stock < 0) return fail("Stock must be a whole number, 0 or more.");
    if (!sku) return fail("Every size needs a SKU.");
    const { error } = await supabase
      .from("product_variants")
      .update({ stock, sku, is_active: formData.get(`active_${id}`) === "on", sort_order: i })
      .eq("id", id)
      .eq("product_id", productId);
    if (error) return fail(error.code === "23505" ? `SKU "${sku}" is already used by another size.` : error.message);
  }

  const newSize = String(formData.get("new_size") ?? "").trim().toUpperCase();
  if (newSize) {
    const newStock = Number(formData.get("new_stock") || 0);
    if (!Number.isInteger(newStock) || newStock < 0) return fail("Stock must be a whole number, 0 or more.");
    const { data: product } = await supabase.from("products").select("slug, color").eq("id", productId).single();
    const newSku = String(formData.get("new_sku") ?? "").trim() || `${product?.slug ?? "item"}-${newSize}`.toUpperCase();
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      size: newSize,
      color: product?.color ?? null,
      sku: newSku,
      stock: newStock,
      sort_order: ids.length,
    });
    if (error) return fail(error.code === "23505" ? `Size ${newSize} or SKU ${newSku} already exists.` : error.message);
  }

  catalogChanged(productId);
  return done("Sizes and stock saved.");
}

export async function deleteVariant(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const productId = z.uuid().parse(formData.get("productId"));
  const { error } = await supabase.from("product_variants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  catalogChanged(productId);
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
export async function uploadImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const productId = z.uuid().parse(formData.get("productId"));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose an image first.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return fail("Use a JPG, PNG or WebP image.");
  if (file.size > 7 * 1024 * 1024) return fail("Image is too large (7 MB max).");

  let webp: Buffer;
  try {
    webp = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return fail("This file could not be read as an image.");
  }

  const path = `${productId}/${randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, webp, { contentType: "image/webp" });
  if (uploadError) return fail(`Upload failed: ${uploadError.message}`);
  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: last } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const alt = String(formData.get("alt") ?? "").trim() || null;
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    url: publicUrl.publicUrl,
    storage_path: path,
    alt,
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return fail(error.message);
  }
  catalogChanged(productId);
  return done("Image uploaded.");
}

export async function deleteImage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const productId = z.uuid().parse(formData.get("productId"));
  const { data: image } = await supabase.from("product_images").select("storage_path").eq("id", id).single();
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (image?.storage_path) await supabase.storage.from(BUCKET).remove([image.storage_path]);
  catalogChanged(productId);
}

/** Moves an image one position earlier or later. The first image is the main photo, the second the hover photo. */
export async function moveImage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const productId = z.uuid().parse(formData.get("productId"));
  const direction = formData.get("direction") === "up" ? -1 : 1;

  const { data: images } = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", productId)
    .order("sort_order");
  if (!images) return;
  const index = images.findIndex((i) => i.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= images.length) return;

  const reordered = [...images];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  for (const [i, img] of reordered.entries()) {
    await supabase.from("product_images").update({ sort_order: i }).eq("id", img.id);
  }
  catalogChanged(productId);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const settingsSchema = z.object({
  currency_code: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Currency code must be 3 letters (e.g. USD, MAD)."),
  currency_prefix: z.string().trim().min(1, "Enter how prices are shown (e.g. US$, MAD ).").max(8),
  shipping_fee: z.coerce.number().min(0, "Delivery fee can't be negative."),
  free_shipping_threshold: optionalNumber(z.number().positive("Free-shipping threshold must be more than 0.")),
});

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const raw = Object.fromEntries(formData);
  // Keep a trailing space in the prefix if the admin typed one (e.g. "MAD ").
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");
  const prefix = String(raw.currency_prefix ?? "").replace(/^\s+/, "").slice(0, 8);

  const { error } = await supabase
    .from("store_settings")
    .update({ ...parsed.data, currency_prefix: prefix })
    .eq("id", 1);
  if (error) return fail(error.message);
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/settings");
  return done("Settings saved. The storefront now uses the new values.");
}

// ---------------------------------------------------------------------------
// Discount codes
// ---------------------------------------------------------------------------
const discountSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,32}$/, "Code: 3 to 32 letters, numbers, dashes or underscores."),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive("Value must be more than 0."),
  min_subtotal: z.coerce.number().min(0).default(0),
  max_uses: optionalNumber(z.number().int().positive()),
  ends_at: z.string().trim().optional(),
});

export async function createDiscount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = discountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");
  const { ends_at, ...rest } = parsed.data;
  if (rest.type === "percent" && rest.value > 100) return fail("A percentage can't be more than 100.");

  const { error } = await supabase.from("discount_codes").insert({
    ...rest,
    ends_at: ends_at ? new Date(`${ends_at}T23:59:59`).toISOString() : null,
  });
  if (error) return fail(error.code === "23505" ? "This code already exists." : error.message);
  revalidatePath("/admin/discounts");
  return done(`Code ${rest.code} created.`);
}

export async function toggleDiscount(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("discount_codes").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  await supabase.from("discount_codes").delete().eq("id", id);
  revalidatePath("/admin/discounts");
}
