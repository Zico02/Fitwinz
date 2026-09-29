"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/admin/auth";
import { normalizeMoroccanPhone } from "@/lib/morocco";
import { createSessionClient } from "@/lib/supabase/server";

// Every action re-checks the signed-in user; RLS additionally limits each query to the user's own rows.
async function requireCustomer() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");
  return { supabase, user };
}

const fail = (message: string): ActionState => ({ ok: false, message });
const done = (message: string): ActionState => ({ ok: true, message });

const phoneField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (!v) return null;
    const phone = normalizeMoroccanPhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Enter a Moroccan phone number, e.g. 06 12 34 56 78." });
      return z.NEVER;
    }
    return phone;
  });

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Please enter your first name.").max(60),
  last_name: z.string().trim().min(1, "Please enter your last name.").max(60),
  phone: phoneField,
});

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireCustomer();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");
  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...parsed.data });
  if (error) return fail("Could not save your profile. Please try again.");
  revalidatePath("/account");
  return done("Profile saved.");
}

const addressSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter the recipient's full name.").max(100),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const phone = normalizeMoroccanPhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Enter a Moroccan phone number, e.g. 06 12 34 56 78." });
        return z.NEVER;
      }
      return phone;
    }),
  city: z.string().trim().min(2, "Please choose a city.").max(60),
  address_line: z.string().trim().min(5, "Please enter the full address.").max(300),
});

export async function addAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireCustomer();
  const raw = Object.fromEntries(formData);
  const city = raw.city === "Other" ? String(raw.otherCity ?? "") : String(raw.city ?? "");
  const parsed = addressSchema.safeParse({ ...raw, city });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");

  const { count } = await supabase.from("saved_addresses").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= 10) return fail("You can save up to 10 addresses.");
  const { error } = await supabase
    .from("saved_addresses")
    .insert({ user_id: user.id, ...parsed.data, is_default: (count ?? 0) === 0 });
  if (error) return fail("Could not save the address. Please try again.");
  revalidatePath("/account");
  return done("Address saved.");
}

export async function setDefaultAddress(formData: FormData) {
  const { supabase, user } = await requireCustomer();
  const id = z.uuid().parse(formData.get("id"));
  // Clear the current default first (only one default per customer is allowed).
  await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
  await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/account");
}

export async function deleteAddress(formData: FormData) {
  const { supabase, user } = await requireCustomer();
  const id = z.uuid().parse(formData.get("id"));
  const { data: removed } = await supabase
    .from("saved_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("is_default")
    .maybeSingle();
  // If the default was removed, promote the oldest remaining address.
  if (removed?.is_default) {
    const { data: next } = await supabase.from("saved_addresses").select("id").order("created_at").limit(1).maybeSingle();
    if (next) await supabase.from("saved_addresses").update({ is_default: true }).eq("id", next.id);
  }
  revalidatePath("/account");
}
