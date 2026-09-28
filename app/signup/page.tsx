import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthShell title="FITWINZ SIGNUP" subtitle="One account across all apps, just to make things a little easier.">
      <SignupForm />
    </AuthShell>
  );
}
