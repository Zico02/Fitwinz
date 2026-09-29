import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="CHOOSE A NEW PASSWORD" subtitle="Enter your new password twice.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
