"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordInput from "@/components/auth/PasswordInput";

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent";

export default function SignupForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", dateOfBirth: "", email: "", password: "" });
  const [acceptEmails, setAcceptEmails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Placeholder until Supabase Auth is wired up in step 2.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setNotice("Accounts are not available yet. You can shop as a guest.");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="firstName" placeholder="First Name*" value={form.firstName} onChange={onChange} className={inputClass} required autoComplete="given-name" />
        <input type="text" name="lastName" placeholder="Last Name*" value={form.lastName} onChange={onChange} className={inputClass} required autoComplete="family-name" />
        <input type="date" name="dateOfBirth" placeholder="Date Of Birth" value={form.dateOfBirth} onChange={onChange} className={`${inputClass} text-gray-600`} autoComplete="bday" />
        <input type="email" name="email" placeholder="Email address*" value={form.email} onChange={onChange} className={inputClass} required autoComplete="email" />
        <PasswordInput name="password" placeholder="Password*" value={form.password} onChange={onChange} required autoComplete="new-password" />
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptEmails"
            checked={acceptEmails}
            onChange={(e) => setAcceptEmails(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="acceptEmails" className="text-sm text-gray-600">
            Tick here to receive emails about our products, apps, sales, exclusive content and more. See our{" "}
            <a href="#" className="underline hover:no-underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {notice && <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">{notice}</p>}
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
