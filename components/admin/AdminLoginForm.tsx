"use client";

import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import { signIn } from "@/app/admin/actions";

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black";

export default function AdminLoginForm({ next }: { next: string }) {
  return (
    <ActionForm action={signIn} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={inputClass} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        className={inputClass}
      />
      <SubmitButton pendingText="Signing in…" className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 disabled:opacity-60">
        SIGN IN
      </SubmitButton>
    </ActionForm>
  );
}
