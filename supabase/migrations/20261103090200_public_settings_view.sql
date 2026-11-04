-- Keep private business data out of anonymous reads.
--
-- The business_settings table contains the admin-only profit target
-- (profit_per_pound). Anonymous visitors must never be able to select that
-- column, even with the public anon key. Public pages read from this view,
-- which exposes only the fields the website needs.

create or replace view public.public_business_settings
with (security_invoker = false) as
select
  id,
  business_name,
  tagline,
  address,
  phone,
  whatsapp,
  email,
  delivery_charge,
  free_delivery_threshold,
  minimum_order,
  payment_methods,
  opening_hours,
  announcement,
  map_embed_url,
  instagram_url,
  facebook_url,
  created_at,
  updated_at
from public.business_settings;

revoke all on public.public_business_settings from anon, authenticated;
grant select on public.public_business_settings to anon, authenticated;

-- Anonymous users can no longer read the base table, which includes the
-- private profit target. Administrators still reach it through RLS with an
-- authenticated session, and server actions use the service role.
revoke select on public.business_settings from anon;
