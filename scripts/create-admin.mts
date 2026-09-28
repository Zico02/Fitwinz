// Creates (or promotes) an admin account for /admin.
//
//   npm run admin:create -- you@example.com "a-long-password"
//
// If the email already has an account, it is promoted to admin and its password is left unchanged.
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error('Usage: npm run admin:create -- you@example.com "a-long-password"');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserId(target: string): Promise<string | null> {
  for (let page = 1; page < 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

let userId = await findUserId(email);
if (userId) {
  console.log(`Account ${email} already exists; promoting it to admin (password unchanged).`);
} else {
  if (!password || password.length < 12) {
    console.error("Choose a password of at least 12 characters.");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error(`Could not create the account: ${error.message}`);
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`Created account ${email}.`);
}

const { error } = await supabase.from("admin_users").upsert({ user_id: userId }, { onConflict: "user_id" });
if (error) {
  console.error(`Could not grant admin access: ${error.message}`);
  process.exit(1);
}
console.log(`${email} is now an admin. Sign in at /admin/login.`);
