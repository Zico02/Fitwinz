"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import PasswordInput from "@/components/auth/PasswordInput";
import { authErrorMessage, MIN_PASSWORD_LENGTH } from "@/lib/auth-helpers";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent";

export default function SignupForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Accounts are not available right now.");

    setIsLoading(true);
    const email = form.email.trim().toLowerCase();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: { first_name: form.firstName.trim(), last_name: form.lastName.trim(), newsletter },
      },
    });
    setIsLoading(false);
    if (signUpError) return setError(authErrorMessage(signUpError));
    // Supabase answers the same way whether or not the email is already registered (no account
    // enumeration), so the confirmation screen covers both cases.
    setSentTo(email);
  };

  if (sentTo) {
    return (
      <div className="text-center space-y-4">
        <MailCheck className="w-12 h-12 mx-auto" />
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <strong className="text-black">{sentTo}</strong>. Open it to activate your account.
        </p>
        <p className="text-xs text-gray-500">
          Nothing after a few minutes? Check your spam folder. If you already have an account,{" "}
          <Link href="/login" className="underline">
            log in
          </Link>{" "}
          instead.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="First Name*" value={form.firstName} onChange={onChange} className={inputClass} required maxLength={60} autoComplete="given-name" aria-label="First name" />
          <input type="text" name="lastName" placeholder="Last Name*" value={form.lastName} onChange={onChange} className={inputClass} required maxLength={60} autoComplete="family-name" aria-label="Last name" />
        </div>
        <input type="email" name="email" placeholder="Email address*" value={form.email} onChange={onChange} className={inputClass} required autoComplete="email" aria-label="Email address" />
        <div>
          <PasswordInput
            name="password"
            placeholder={`Password* (min. ${MIN_PASSWORD_LENGTH} characters)`}
            value={form.password}
            onChange={onChange}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            aria-label="Password"
          />
        </div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptEmails"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="acceptEmails" className="text-sm text-gray-600">
            Tick here to receive emails about our products, sales, exclusive content and more.
          </label>
        </div>
        <p className="text-xs text-gray-500">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:no-underline">
            Terms &amp; Conditions
          </Link>
          , including how we handle your personal data.
        </p>
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
          {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>
      </form>
      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-semibold underline hover:no-underline">
            Log in
          </Link>
        </p>
        <Link href="/" className="block text-sm text-gray-600 underline hover:text-black">
          Use as a guest
        </Link>
      </div>
    </>
  );
}
