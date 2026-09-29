"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/auth/PasswordInput";
import { useAuth } from "@/components/AuthContext";
import { authErrorMessage, safeNextPath } from "@/lib/auth-helpers";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const NOTICES: Record<string, string> = {
  link: "That link is invalid or has expired. Please try again.",
  "password-updated": "Your password was updated. Please log in.",
};

export default function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const target = safeNextPath(next);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(notice && NOTICES[notice] ? NOTICES[notice] : "");
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [info, setInfo] = useState("");

  // Already signed in: go straight to the account.
  useEffect(() => {
    if (ready && user) router.replace(target);
  }, [ready, user, router, target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Accounts are not available right now.");
    setIsLoading(true);
    setError("");
    setInfo("");
    setUnconfirmed(false);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoading(false);
    if (signInError) {
      setError(authErrorMessage(signInError));
      setUnconfirmed(signInError.code === "email_not_confirmed");
      return;
    }
    router.replace(target);
    router.refresh();
  };

  const resendConfirmation = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (resendError) setError(authErrorMessage(resendError));
    else {
      setError("");
      setUnconfirmed(false);
      setInfo("We sent you a new confirmation email.");
    }
  };

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
        <PasswordInput
          placeholder="Password*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          aria-label="Password"
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black underline">
            Forgot password?
          </Link>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
            {unconfirmed && (
              <button type="button" onClick={resendConfirmation} className="block mt-2 underline font-semibold">
                Send the confirmation email again
              </button>
            )}
          </p>
        )}
        {info && <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{info}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "LOGGING IN..." : "LOG IN"}
        </button>
      </form>
      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-black font-semibold underline hover:no-underline">
            Sign up
          </Link>
        </p>
        <Link href="/" className="block text-sm text-gray-600 underline hover:text-black">
          Use as a guest
        </Link>
      </div>
    </>
  );
}
