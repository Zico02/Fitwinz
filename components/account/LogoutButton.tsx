"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

export default function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);
  return (
    <button
      onClick={async () => {
        setPending(true);
        await signOut();
        router.replace("/");
        router.refresh();
      }}
      disabled={pending}
      className="inline-flex items-center gap-2 border border-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      {pending ? "LOGGING OUT..." : "LOG OUT"}
    </button>
  );
}
