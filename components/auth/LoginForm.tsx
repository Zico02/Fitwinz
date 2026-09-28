"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordInput from "@/components/auth/PasswordInput";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");

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
        <input
          type="email"
          placeholder="Email address*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          required
          autoComplete="email"
        />
        <PasswordInput
          placeholder="Password*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="text-right">
          <a href="#" className="text-sm text-gray-600 hover:text-black underline">
            Forgot password?
          </a>
        </div>
        {notice && <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">{notice}</p>}
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
