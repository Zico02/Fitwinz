"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { authErrorMessage } from "@/lib/auth-helpers";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Accounts are not available right now.");
    setIsLoading(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setIsLoading(false);
    // Same answer whether or not the email has an account (no account enumeration).
    if (resetError && (resetError.status === 429 || resetError.code?.startsWith("over_"))) {
      return setError(authErrorMessage(resetError));
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <MailCheck className="w-12 h-12 mx-auto" />
        <p className="text-sm text-gray-600">
          If an account exists for <strong className="text-black">{email.trim()}</strong>, you&apos;ll receive a link to reset
          your password in a few minutes. Check your spam folder too.
        </p>
        <Link href="/login" className="inline-block text-sm underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email address*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
          autoComplete="email"
          aria-label="Email address"
        />
        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "SENDING..." : "SEND RESET LINK"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-gray-600 underline hover:text-black">
          Back to log in
        </Link>
      </div>
    </>
  );
}
