"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/auth/PasswordInput";
import { useAuth } from "@/components/AuthContext";
import { authErrorMessage, MIN_PASSWORD_LENGTH } from "@/lib/auth-helpers";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // The reset link (via /auth/confirm) signs the user in; without a session the link was invalid.
  if (ready && !user) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold">
          REQUEST A NEW LINK
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (password !== confirm) return setError("The two passwords don't match.");
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Accounts are not available right now.");
    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (updateError) return setError(authErrorMessage(updateError));
    router.replace("/account?notice=password-updated");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        placeholder={`New password* (min. ${MIN_PASSWORD_LENGTH} characters)`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
        aria-label="New password"
      />
      <PasswordInput
        placeholder="Confirm new password*"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
        aria-label="Confirm new password"
      />
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading || !ready}
        className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isLoading ? "SAVING..." : "SAVE NEW PASSWORD"}
      </button>
    </form>
  );
}
