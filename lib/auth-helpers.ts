// Shared helpers for the customer auth pages.

export const MIN_PASSWORD_LENGTH = 8;

/** Only same-site paths, never protocol-relative URLs or the admin area. */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/admin") || next.startsWith("/auth/")) return fallback;
  return next;
}

/** Friendly text for Supabase Auth errors (codes: https://supabase.com/docs/guides/auth/debugging/error-codes). */
export function authErrorMessage(error: { code?: string; message: string; status?: number } | null | undefined): string {
  if (!error) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Please confirm your email address first: open the link we sent you.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "weak_password":
      return `Please choose a stronger password (at least ${MIN_PASSWORD_LENGTH} characters).`;
    case "same_password":
      return "Your new password must be different from the old one.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Please log in.";
    case "signup_disabled":
      return "Account creation is temporarily unavailable.";
    case "validation_failed":
    case "email_address_invalid":
      return "Please enter a valid email address.";
    default:
      return error.status === 429 ? "Too many attempts. Please wait a few minutes and try again." : "Something went wrong. Please try again.";
  }
}
