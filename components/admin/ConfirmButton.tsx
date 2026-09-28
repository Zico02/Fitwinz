"use client";

import { useFormStatus } from "react-dom";

/** Submit button that asks for confirmation first. Optional formAction targets a different Server Action. */
export default function ConfirmButton({
  message,
  children,
  className,
  formAction,
  name,
  value,
  form,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string;
  /** Id of the form this button submits, when it sits outside that form. */
  form?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      formAction={formAction}
      form={form}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
