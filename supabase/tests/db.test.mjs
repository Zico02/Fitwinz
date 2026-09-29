// Runs the Supabase migrations in an in-memory Postgres (PGlite) and checks the order logic,
// stock handling and Row Level Security. No Supabase project or Docker needed.
//
//   npm run test:db
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS = path.join(import.meta.dirname, "..", "migrations");

// Minimal stand-ins for what Supabase provides out of the box.
const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema auth, storage to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`;

const SUPABASE_DEFAULT_GRANTS = `
  grant usage on schema public to anon, authenticated, service_role;
  grant all on all tables in schema public to anon, authenticated, service_role;
  grant all on all sequences in schema public to anon, authenticated, service_role;
`;

const db = new PGlite();
await db.exec(SUPABASE_STUBS);
for (const file of fs.readdirSync(MIGRATIONS).sort()) {
  await db.exec(fs.readFileSync(path.join(MIGRATIONS, file), "utf8"));
}
await db.exec(SUPABASE_DEFAULT_GRANTS);

const ADMIN = "00000000-0000-0000-0000-00000000000a";
const USER = "00000000-0000-0000-0000-00000000000b";

async function as(role, sub, fn) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false); set role ${role};`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);");
  }
}

async function expectError(promise, message) {
  await assert.rejects(promise, (e) => {
    assert.match(e.message, new RegExp(message));
    return true;
  });
}

const stock = async (sku) =>
  (await db.query("select stock from public.product_variants where sku = $1", [sku])).rows[0].stock;

const placeOrder = (items, extra = {}) =>
  db.query(
    `select * from public.place_order($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)`,
    [
      extra.name ?? "Amine Test",
      extra.phone ?? "+212612345678",
      extra.email ?? "amine@example.com",
      "Casablanca",
      "12 Rue Test, Maarif",
      extra.notes ?? null,
      JSON.stringify(items),
      extra.code ?? null,
      extra.newsletter ?? false,
      extra.expectedTotal ?? null,
    ],
  );

let passed = 0;
async function test(name, fn) {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

// Fixture data (as the seed script would create it).
await db.exec(`
  insert into auth.users (id, email) values ('${ADMIN}', 'admin@example.com'), ('${USER}', 'user@example.com');
  insert into public.admin_users (user_id) values ('${ADMIN}');
  insert into public.categories (slug, name) values ('men', 'Men');
  insert into public.products (slug, category_id, name, fit, color, price)
    select 'oversized-fit-ice-blue', id, 'Oversized Fit', 'Thermal Wool Blend', 'Ice Blue', 44 from public.categories;
  insert into public.products (slug, name, price, is_active) values ('hidden-product', 'Hidden', 10, false);
  insert into public.product_variants (product_id, size, sku, stock)
    select id, s, 'OFIB-' || s, 10 from public.products, unnest(array['S', 'M']) s where slug = 'oversized-fit-ice-blue';
  insert into public.product_variants (product_id, size, sku, stock)
    select id, 'M', 'HID-M', 10 from public.products where slug = 'hidden-product';
  insert into public.product_images (product_id, url, sort_order)
    select id, '/images/ice_front.webp', 0 from public.products where slug = 'oversized-fit-ice-blue';
  insert into public.discount_codes (code, type, value) values ('WELCOME10', 'percent', 10);
  insert into public.discount_codes (code, type, value, is_active) values ('OLD', 'fixed', 5, false);
`);

console.log("Database tests");

await test("settings seeded: USD, US$15 shipping, free from US$100", async () => {
  const { rows } = await db.query("select currency_code, currency_prefix, shipping_fee::float, free_shipping_threshold::float from public.store_settings");
  assert.deepEqual(rows[0], { currency_code: "USD", currency_prefix: "US$", shipping_fee: 15, free_shipping_threshold: 100 });
});

await test("anon sees active products only", async () => {
  const rows = await as("anon", null, async () => (await db.query("select slug from public.products order by slug")).rows);
  assert.deepEqual(rows.map((r) => r.slug), ["oversized-fit-ice-blue"]);
});

await test("anon cannot read orders, customers or discount codes", async () => {
  await as("anon", null, async () => {
    for (const t of ["orders", "customers", "discount_codes", "newsletter_subscribers"]) {
      assert.equal((await db.query(`select * from public.${t}`)).rows.length, 0, t);
    }
  });
});

await test("anon and signed-in users cannot call place_order", async () => {
  await as("anon", null, () => expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 1 }]), "permission denied"));
  await as("authenticated", USER, () => expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 1 }]), "permission denied"));
});

await test("non-admin cannot change prices; admin can", async () => {
  await as("authenticated", USER, async () => {
    const r = await db.query("update public.products set price = 1 where slug = 'oversized-fit-ice-blue'");
    assert.equal(r.affectedRows, 0);
  });
  await as("authenticated", ADMIN, async () => {
    const r = await db.query("update public.products set price = 44 where slug = 'oversized-fit-ice-blue'");
    assert.equal(r.affectedRows, 1);
  });
});

let firstOrder;
await test("order below threshold: DB prices, US$15 shipping, stock decremented, duplicates merged", async () => {
  const { rows } = await as("service_role", null, () =>
    placeOrder([
      { slug: "oversized-fit-ice-blue", size: "M", quantity: 1 },
      { slug: "oversized-fit-ice-blue", size: "M", quantity: 1 },
    ], { expectedTotal: 103 }),
  );
  firstOrder = rows[0];
  assert.equal(firstOrder.order_number, "FW-1001");
  assert.equal(Number(firstOrder.total), 44 * 2 + 15);
  assert.equal(await stock("OFIB-M"), 8);
  const items = (await db.query("select quantity, unit_price::float, line_total::float, image_url from public.order_items where order_id = $1", [firstOrder.order_id])).rows;
  assert.deepEqual(items, [{ quantity: 2, unit_price: 44, line_total: 88, image_url: "/images/ice_front.webp" }]);
});

await test("free shipping at or above US$100", async () => {
  const { rows } = await as("service_role", null, () => placeOrder([{ slug: "oversized-fit-ice-blue", size: "S", quantity: 3 }]));
  const order = (await db.query("select subtotal::float, shipping_fee::float, total::float from public.orders where id = $1", [rows[0].order_id])).rows[0];
  assert.deepEqual(order, { subtotal: 132, shipping_fee: 0, total: 132 });
});

await test("out of stock rolls back the whole order", async () => {
  const before = [await stock("OFIB-S"), await stock("OFIB-M")];
  await as("service_role", null, () =>
    expectError(
      placeOrder([
        { slug: "oversized-fit-ice-blue", size: "S", quantity: 1 },
        { slug: "oversized-fit-ice-blue", size: "M", quantity: 9 },
      ]),
      "OUT_OF_STOCK",
    ),
  );
  assert.deepEqual([await stock("OFIB-S"), await stock("OFIB-M")], before);
});

await test("inactive products and unknown sizes are rejected", async () => {
  await as("service_role", null, async () => {
    await expectError(placeOrder([{ slug: "hidden-product", size: "M", quantity: 1 }]), "PRODUCT_UNAVAILABLE");
    await expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "XXL", quantity: 1 }]), "PRODUCT_UNAVAILABLE");
  });
});

await test("invalid input is rejected", async () => {
  await as("service_role", null, async () => {
    await expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 1 }], { phone: "0612345678" }), "INVALID_INPUT");
    await expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 0 }]), "INVALID_QUANTITY");
    await expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 99 }]), "INVALID_QUANTITY");
    await expectError(placeOrder([]), "EMPTY_CART");
  });
});

await test("price change is detected before anything is written", async () => {
  const count = async () => Number((await db.query("select count(*) from public.orders")).rows[0].count);
  const before = await count();
  await as("service_role", null, () =>
    expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 1 }], { expectedTotal: 50 }), "PRICE_CHANGED"),
  );
  assert.equal(await count(), before);
});

await test("discount codes: valid applies and counts, inactive rejected", async () => {
  const { rows } = await as("service_role", null, () =>
    placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 1 }], { code: "welcome10", newsletter: true }),
  );
  const order = (await db.query("select discount_code, discount_amount::float, shipping_fee::float, total::float from public.orders where id = $1", [rows[0].order_id])).rows[0];
  assert.deepEqual(order, { discount_code: "WELCOME10", discount_amount: 4.4, shipping_fee: 15, total: 54.6 });
  assert.equal((await db.query("select used_count from public.discount_codes where code = 'WELCOME10'")).rows[0].used_count, 1);
  assert.equal((await db.query("select count(*) from public.newsletter_subscribers")).rows[0].count, 1);
  await as("service_role", null, () =>
    expectError(placeOrder([{ slug: "oversized-fit-ice-blue", size: "M", quantity: 1 }], { code: "OLD" }), "DISCOUNT_INVALID"),
  );
});

await test("repeat customer is matched by phone", async () => {
  const { rows } = await db.query("select count(*) from public.customers");
  assert.equal(Number(rows[0].count), 1);
});

await test("status changes: admin only, cancel restocks exactly once, closed orders stay closed", async () => {
  await as("authenticated", USER, () =>
    expectError(db.query("select public.set_order_status($1, 'confirmed')", [firstOrder.order_id]), "NOT_AUTHORIZED"),
  );
  const before = await stock("OFIB-M");
  await as("authenticated", ADMIN, async () => {
    await db.query("select public.set_order_status($1, 'shipped')", [firstOrder.order_id]);
    await db.query("select public.set_order_status($1, 'cancelled')", [firstOrder.order_id]);
    await db.query("select public.set_order_status($1, 'cancelled')", [firstOrder.order_id]);
    await expectError(db.query("select public.set_order_status($1, 'pending')", [firstOrder.order_id]), "ORDER_CLOSED");
  });
  assert.equal(await stock("OFIB-M"), before + 2);
  const shipment = (await db.query("select shipped_at is not null as shipped from public.shipments where order_id = $1", [firstOrder.order_id])).rows[0];
  assert.equal(shipment.shipped, true);
});

await test("order emails: each kind sent at most once per order, failures can be retried", async () => {
  const claim = (kind, status = "sending") =>
    db.query("insert into public.order_emails (order_id, kind, status) values ($1, $2, $3)", [firstOrder.order_id, kind, status]);
  await claim("shipped");
  await expectError(claim("shipped"), "duplicate key");
  await db.query("update public.order_emails set status = 'failed' where order_id = $1 and kind = 'shipped'", [firstOrder.order_id]);
  await claim("shipped"); // retry after a failure is allowed
  await db.query("update public.order_emails set status = 'sent' where order_id = $1 and kind = 'shipped' and status = 'sending'", [firstOrder.order_id]);
  await expectError(claim("shipped"), "duplicate key");
  await claim("confirmation"); // other kinds are independent
  await as("anon", null, async () => assert.equal((await db.query("select * from public.order_emails")).rows.length, 0));
  await as("authenticated", USER, async () => assert.equal((await db.query("select * from public.order_emails")).rows.length, 0));
  await as("authenticated", ADMIN, async () => assert.ok((await db.query("select * from public.order_emails")).rows.length >= 3));
});

await test("shipment tracking link must be http(s)", async () => {
  await expectError(
    db.query("update public.shipments set tracking_url = 'javascript:alert(1)' where order_id = $1", [firstOrder.order_id]),
    "check constraint",
  );
});

await test("cancelled email: new kind, sent at most once, reason limited to 500 characters", async () => {
  const claim = () =>
    db.query("insert into public.order_emails (order_id, kind, status) values ($1, 'cancelled', 'sending')", [firstOrder.order_id]);
  await claim();
  await expectError(claim(), "duplicate key");
  await db.query("update public.orders set cancellation_reason = 'Out of stock' where id = $1", [firstOrder.order_id]);
  await expectError(
    db.query("update public.orders set cancellation_reason = $2 where id = $1", [firstOrder.order_id, "x".repeat(501)]),
    "check constraint",
  );
});

const CUST_A = "00000000-0000-0000-0000-0000000000c1";
const CUST_B = "00000000-0000-0000-0000-0000000000c2";

await test("accounts: signup creates a profile with names; newsletter only when ticked", async () => {
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values
      ($1, 'A@Example.com', '{"first_name":"Amine","last_name":"Test","newsletter":true}'),
      ($2, 'b@example.com', '{"first_name":"Sara","last_name":"B","newsletter":false}')`,
    [CUST_A, CUST_B],
  );
  const { rows } = await db.query("select id, first_name, last_name from public.profiles where id in ($1, $2) order by first_name", [CUST_A, CUST_B]);
  assert.deepEqual(rows.map((r) => r.first_name), ["Amine", "Sara"]);
  const subs = (await db.query("select email, source from public.newsletter_subscribers where source = 'signup'")).rows;
  assert.deepEqual(subs, [{ email: "a@example.com", source: "signup" }]);
});

await test("accounts: a customer only sees their own profile, addresses, wishlist and orders", async () => {
  await as("authenticated", CUST_A, async () => {
    await db.query("insert into public.saved_addresses (user_id, full_name, phone, city, address_line, is_default) values ($1, 'Amine Test', '+212612345678', 'Rabat', '1 Avenue Test', true)", [CUST_A]);
    await db.query("insert into public.wishlist_items (user_id, product_slug) values ($1, 'pro-shaker-black')", [CUST_A]);
    await expectError(
      db.query("insert into public.saved_addresses (user_id, full_name, phone, city, address_line) values ($1, 'X Y', '+212612345678', 'Rabat', '1 Avenue Test')", [CUST_B]),
      "row-level security",
    );
    await expectError(db.query("insert into public.wishlist_items (user_id, product_slug) values ($1, 'x')", [CUST_B]), "row-level security");
  });
  await db.query("update public.orders set user_id = $1 where id = $2", [CUST_A, firstOrder.order_id]);

  await as("authenticated", CUST_B, async () => {
    for (const t of ["saved_addresses", "wishlist_items", "orders", "order_items", "customers", "order_emails", "admin_users"]) {
      assert.equal((await db.query(`select * from public.${t}`)).rows.length, 0, t);
    }
    assert.deepEqual((await db.query("select id from public.profiles")).rows.map((r) => r.id), [CUST_B]);
    const upd = await db.query("update public.profiles set first_name = 'Hacked' where id = $1", [CUST_A]);
    assert.equal(upd.affectedRows, 0);
    const del = await db.query("delete from public.saved_addresses");
    assert.equal(del.affectedRows, 0);
  });

  await as("authenticated", CUST_A, async () => {
    assert.equal((await db.query("select * from public.orders")).rows.length, 1);
    assert.ok((await db.query("select * from public.order_items")).rows.length >= 1);
    assert.equal((await db.query("select * from public.saved_addresses")).rows.length, 1);
    // Customers can read their orders but never change them.
    const upd = await db.query("update public.orders set total = 0 where id = $1", [firstOrder.order_id]);
    assert.equal(upd.affectedRows, 0);
    await expectError(db.query("select public.set_order_status($1, 'confirmed')", [firstOrder.order_id]), "NOT_AUTHORIZED");
    assert.equal((await db.query("select public.is_admin() as a")).rows[0].a, false);
  });
});

await test("accounts: only one default address per customer; phone must be Moroccan", async () => {
  await as("authenticated", CUST_A, async () => {
    await expectError(
      db.query("insert into public.saved_addresses (user_id, full_name, phone, city, address_line, is_default) values ($1, 'Amine Test', '+212612345678', 'Fès', '2 Rue Test', true)", [CUST_A]),
      "duplicate key",
    );
    await expectError(db.query("update public.profiles set phone = '0612345678' where id = $1", [CUST_A]), "check constraint");
  });
});

await test("rate limiter: allows up to the limit, then blocks; server only", async () => {
  const hit = () => db.query("select public.rate_limit_allow('admin-login:test', 3, 900) as ok").then((r) => r.rows[0].ok);
  assert.deepEqual([await hit(), await hit(), await hit(), await hit()], [true, true, true, false]);
  await as("anon", null, () => expectError(db.query("select public.rate_limit_allow('x', 1, 60)"), "permission denied"));
  await as("authenticated", CUST_A, () => expectError(db.query("select public.rate_limit_allow('x', 1, 60)"), "permission denied"));
});

await test("stock can never go negative", async () => {
  await expectError(db.query("update public.product_variants set stock = -1 where sku = 'OFIB-M'"), "check constraint");
});

console.log(`\n${passed} passed`);
await db.close();
