import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

// Target of the links in the Supabase auth emails (confirm signup, reset password).
// Verifies the one-time token on the server, which signs the user in via cookies, then redirects.
const OTP_TYPES: EmailOtpType[] = ["signup", "email", "recovery", "invite", "magiclink", "email_change"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");
  const supabase = await createSessionClient();

  let ok = false;
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
    if (error) console.warn(`[auth] verifyOtp (${type}) failed: ${error.code ?? error.message}`);
  } else if (code) {
    // Default Supabase (PKCE) links, if the email templates weren't customised.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error) console.warn(`[auth] code exchange failed: ${error.code ?? error.message}`);
  }

  if (!ok) redirect("/login?error=link");
  redirect(type === "recovery" ? "/reset-password" : "/account?notice=welcome");
}
