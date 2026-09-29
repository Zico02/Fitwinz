import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; notice?: string }> }) {
  const { next, error, notice } = await searchParams;
  return (
    <AuthShell
      title="FITWINZ LOGIN"
      subtitle="Shop your styles, save top picks to your wishlist, track those orders & train with us"
    >
      <LoginForm next={next} notice={error ?? notice} />
    </AuthShell>
  );
}
