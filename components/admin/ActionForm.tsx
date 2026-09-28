"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/admin/auth";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className = "bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-60",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

/** A form bound to a Server Action that returns { ok, message }; shows the message inline. */
export default function ActionForm({
  action,
  children,
  className,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      {state && (
        <p
          role="status"
          className={`mt-3 text-sm rounded-lg px-3 py-2 ${
            state.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
