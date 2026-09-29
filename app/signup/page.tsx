import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthShell title="FITWINZ SIGNUP" subtitle="Create your account to track your orders and save your favorites.">
      <SignupForm />
    </AuthShell>
  );
}
