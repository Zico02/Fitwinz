// Creates an admin account for /admin, or repairs an existing one.
//
//   npm run admin:create -- you@example.com
//
// The password is asked interactively (hidden, typed twice), so the shell can never alter it.
// Passing it as a second argument still works, but PowerShell/bash may rewrite characters
// such as $, ` or ! inside "...": prefer the prompt.
//
// If the account already exists, its password is replaced, its email is marked as confirmed
// and it is granted admin access.
import { createClient } from "@supabase/supabase-js";

const MIN_LENGTH = 12;

const [emailArg, passwordArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Usage: npm run admin:create -- you@example.com");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secret = process.env.SUPABASE_SECRET_KEY?.trim();
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

/** Reads a line from the terminal without echoing it (shows * per character). */
function askHidden(prompt: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    console.error("No interactive terminal: run this command directly in PowerShell or a terminal window.");
    process.exit(1);
  }
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          // Ctrl+C
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (ch >= " ") {
          value += ch;
          process.stdout.write("*");
        }
      }
    };
    stdin.on("data", onData);
  });
}

async function choosePassword(): Promise<string> {
  if (passwordArg !== undefined) {
    console.warn("Note: password taken from the command line. If sign-in fails, run again without it to type it safely.");
    return passwordArg;
  }
  for (;;) {
    const first = await askHidden(`New password for ${email} (min. ${MIN_LENGTH} characters): `);
    if (first.length < MIN_LENGTH) {
      console.log(`Too short (${first.length} characters). Try again.`);
      continue;
    }
    const second = await askHidden("Type it again: ");
    if (first !== second) {
      console.log("The two passwords don't match. Try again.");
      continue;
    }
    return first;
  }
}

async function findUserId(target: string): Promise<string | null> {
  for (let page = 1; page < 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

let userId = await findUserId(email);
const password = await choosePassword();
if (password.length < MIN_LENGTH) {
  console.error(`Choose a password of at least ${MIN_LENGTH} characters.`);
  process.exit(1);
}

if (userId) {
  const { error } = await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
  if (error) {
    console.error(`Could not update the account: ${error.message}`);
    process.exit(1);
  }
  console.log(`Updated ${email}: new password set, email confirmed.`);
} else {
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

// Prove the password works end to end, exactly like the login page does.
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
if (publishable) {
  const check = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: signInError } = await check.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error(`Account saved, but a test sign-in failed: ${signInError.message}`);
    process.exit(1);
  }
  await check.auth.signOut();
  console.log("Test sign-in succeeded.");
}
console.log(`${email} is an admin. Sign in at http://localhost:3000/admin/login`);
