/**
 * Create (or promote) a Laiba Bakes administrator.
 *
 * Usage:
 *   npm run create-admin -- admin@example.com "strong-password" "Admin Name"
 *
 * The script reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local (or the current environment). It creates a confirmed Supabase Auth
 * user and adds the matching row to public.admin_users.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "";
const fullName = (process.argv[4] ?? process.env.ADMIN_NAME ?? "Administrator").trim();

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!url || !serviceKey) {
  fail(
    "Missing Supabase credentials. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local first.",
  );
}
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail(
    'Provide a valid admin email, e.g. npm run create-admin -- admin@laibabakes.com "strong-password" "Laiba"',
  );
}
if (password.length < 6) {
  fail("The password must be at least 6 characters.");
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findExistingUser() {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (match) return match;
    if (data.users.length < 1000) return null;
  }
  return null;
}

async function main() {
  console.log(`\nLaiba Bakes — admin setup\n`);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId = created?.user?.id ?? null;

  if (createError) {
    const alreadyExists =
      createError.message.toLowerCase().includes("already") ||
      createError.status === 422;

    if (!alreadyExists) {
      throw new Error(createError.message);
    }

    const existing = await findExistingUser();
    if (!existing) {
      throw new Error(
        `A user with ${email} could not be found. Reset the password in Supabase Auth and run the script again.`,
      );
    }
    userId = existing.id;
    console.log(`• Existing auth user found for ${email}.`);

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (updateError) {
      console.warn(`  Password was not updated: ${updateError.message}`);
    }
  } else {
    console.log(`• Created Supabase Auth user for ${email}.`);
  }

  if (!userId) throw new Error("The auth user id could not be resolved.");

  const { error: profileError } = await supabase.from("admin_users").upsert(
    {
      user_id: userId,
      email,
      full_name: fullName,
      role: "admin",
    },
    { onConflict: "user_id" },
  );

  if (profileError) throw new Error(profileError.message);

  console.log(`• Administrator profile saved in public.admin_users.`);
  console.log(`\n✔ Done. Sign in at /admin/login with ${email}.\n`);
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
