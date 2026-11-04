-- Laiba Bakes initial schema
-- Run through Supabase migrations (`supabase db push`) or paste into SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin users
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default 'Administrator',
  role text not null default 'admin' check (role in ('admin', 'manager')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_users_user_id_idx on public.admin_users(user_id);

-- Helper function used by RLS policies. Security definer prevents recursion on
-- admin_users while checking the current auth user's membership.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  pricing_type text not null default 'per_pound' check (pricing_type in ('per_pound', 'fixed')),
  image_url text,
  flavor text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_sort_idx on public.products(is_active, sort_order);

create table if not exists public.cake_sizes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  pounds numeric(5, 2) not null unique check (pounds > 0),
  reference_price numeric(10, 2) not null default 0 check (reference_price >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decoration_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  charge numeric(10, 2) not null default 0 check (charge >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  code text unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null default 0 check (discount_value >= 0),
  minimum_order numeric(10, 2) not null default 0 check (minimum_order >= 0),
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deals_percentage_max check (
    discount_type <> 'percentage' or discount_value <= 100
  ),
  constraint deals_date_order check (
    starts_at is null or ends_at is null or ends_at >= starts_at
  )
);

create index if not exists deals_code_idx on public.deals ((upper(code)));
create index if not exists deals_active_idx on public.deals(is_active);

-- ---------------------------------------------------------------------------
-- Customers & orders
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  whatsapp text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on public.customers(phone);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  lookup_token uuid not null unique default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  order_type text not null default 'standard' check (order_type in ('standard', 'custom')),
  status text not null default 'new' check (
    status in (
      'new',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'cancelled'
    )
  ),
  payment_method text not null,
  payment_status text not null default 'unpaid' check (
    payment_status in ('unpaid', 'paid', 'refunded')
  ),
  delivery_type text not null check (delivery_type in ('delivery', 'pickup')),
  required_date date not null,
  required_time text not null,
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  decoration_charge numeric(10, 2) not null default 0 check (decoration_charge >= 0),
  additional_total numeric(10, 2) not null default 0 check (additional_total >= 0),
  delivery_charge numeric(10, 2) not null default 0 check (delivery_charge >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total numeric(10, 2) not null default 0 check (total >= 0),
  estimated_profit numeric(10, 2) not null default 0,
  customer_notes text,
  cake_message text,
  cake_colour text,
  decoration_style text,
  design_description text,
  reference_image_path text,
  internal_notes text,
  whatsapp_opened boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_required_date_idx on public.orders(required_date);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  pricing_type text not null check (pricing_type in ('per_pound', 'fixed')),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  pounds numeric(5, 2) check (pounds is null or pounds > 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

create table if not exists public.customizations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  cake_type text,
  flavour text,
  weight text,
  quantity integer,
  decoration text,
  colour text,
  message text,
  special_instructions text,
  design_description text,
  reference_image_path text,
  created_at timestamptz not null default now()
);

create index if not exists customizations_order_id_idx on public.customizations(order_id);

-- ---------------------------------------------------------------------------
-- Contact & settings
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on public.contact_messages(status);
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Laiba Bakes',
  tagline text,
  address text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  delivery_charge numeric(10, 2) not null default 200 check (delivery_charge >= 0),
  free_delivery_threshold numeric(10, 2) not null default 5000 check (free_delivery_threshold >= 0),
  minimum_order numeric(10, 2) not null default 0 check (minimum_order >= 0),
  profit_per_pound numeric(10, 2) not null default 100 check (profit_per_pound >= 0),
  payment_methods text[] not null default array['Cash on delivery', 'Cash on pickup'],
  opening_hours text,
  announcement text,
  map_embed_url text,
  instagram_url text,
  facebook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly one settings row is allowed.
create unique index if not exists business_settings_singleton_idx
  on public.business_settings ((true));

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists cake_sizes_set_updated_at on public.cake_sizes;
create trigger cake_sizes_set_updated_at before update on public.cake_sizes
for each row execute function public.set_updated_at();

drop trigger if exists decoration_options_set_updated_at on public.decoration_options;
create trigger decoration_options_set_updated_at before update on public.decoration_options
for each row execute function public.set_updated_at();

drop trigger if exists deals_set_updated_at on public.deals;
create trigger deals_set_updated_at before update on public.deals
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at before update on public.business_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cake_sizes enable row level security;
alter table public.decoration_options enable row level security;
alter table public.deals enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customizations enable row level security;
alter table public.contact_messages enable row level security;
alter table public.business_settings enable row level security;

-- admin_users: an administrator can manage admin accounts, a signed-in user can
-- read their own membership row (used by middleware).
drop policy if exists "admin_users_select_self_or_admin" on public.admin_users;
create policy "admin_users_select_self_or_admin" on public.admin_users
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_users_admin_write" on public.admin_users;
create policy "admin_users_admin_write" on public.admin_users
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Public catalogue reads only active records.
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
for select to anon, authenticated using (is_active);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select to anon, authenticated using (is_active);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "cake_sizes_public_read" on public.cake_sizes;
create policy "cake_sizes_public_read" on public.cake_sizes
for select to anon, authenticated using (is_active);

drop policy if exists "cake_sizes_admin_all" on public.cake_sizes;
create policy "cake_sizes_admin_all" on public.cake_sizes
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "decorations_public_read" on public.decoration_options;
create policy "decorations_public_read" on public.decoration_options
for select to anon, authenticated using (is_active);

drop policy if exists "decorations_admin_all" on public.decoration_options;
create policy "decorations_admin_all" on public.decoration_options
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "deals_public_read" on public.deals;
create policy "deals_public_read" on public.deals
for select to anon, authenticated using (is_active);

drop policy if exists "deals_admin_all" on public.deals;
create policy "deals_admin_all" on public.deals
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_public_read" on public.business_settings;
create policy "settings_public_read" on public.business_settings
for select to anon, authenticated using (true);

drop policy if exists "settings_admin_all" on public.business_settings;
create policy "settings_admin_all" on public.business_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders and customer data are never exposed to anon. The website writes and
-- reads these through server actions using the service role after validation.
drop policy if exists "customers_admin_all" on public.customers;
create policy "customers_admin_all" on public.customers
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "customizations_admin_all" on public.customizations;
create policy "customizations_admin_all" on public.customizations
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contact_messages_admin_all" on public.contact_messages;
create policy "contact_messages_admin_all" on public.contact_messages
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets and policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cake-references',
  'cake-references',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
for all to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

-- Reference images are private. Admins can read them through signed URLs; the
-- public server action uploads with the service role.
drop policy if exists "cake_references_admin_read" on storage.objects;
create policy "cake_references_admin_read" on storage.objects
for select to authenticated
using (bucket_id = 'cake-references' and public.is_admin());

drop policy if exists "cake_references_admin_write" on storage.objects;
create policy "cake_references_admin_write" on storage.objects
for all to authenticated
using (bucket_id = 'cake-references' and public.is_admin())
with check (bucket_id = 'cake-references' and public.is_admin());

-- Helpful grants (RLS still applies).
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.cake_sizes,
  public.decoration_options, public.deals, public.business_settings
  to anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;
grant select, insert, update, delete on public.customers, public.orders,
  public.order_items, public.customizations, public.contact_messages
  to authenticated;
grant select, insert, update, delete on public.categories, public.products,
  public.cake_sizes, public.decoration_options, public.deals,
  public.business_settings to authenticated;
