-- Initial Laiba Bakes catalogue and business settings.
-- Safe to run once as part of `supabase db push`; existing edited records are
-- not overwritten because each insert uses ON CONFLICT DO NOTHING.

insert into public.categories (id, name, slug, description, image_url, sort_order, is_active)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Signature Cakes',
    'signature-cakes',
    'Our most-loved flavours, baked fresh to order with silky frosting and premium ingredients.',
    '/images/chocolate-cake.jpg',
    1,
    true
  ),
  (
    '11111111-1111-4111-8111-222222222222',
    'Celebration Cakes',
    'celebration-cakes',
    'Show-stopping centrepieces for birthdays, weddings, anniversaries and every happy occasion.',
    '/images/custom-cake.jpg',
    2,
    true
  ),
  (
    '11111111-1111-4111-8111-333333333333',
    'Little Treats',
    'little-treats',
    'Glass cakes, cupcakes and pastries for a sweet little something whenever you need it.',
    '/images/cupcakes.jpg',
    3,
    true
  )
on conflict (slug) do nothing;

insert into public.cake_sizes (id, label, pounds, reference_price, sort_order, is_active)
values
  ('33333333-3333-4333-8333-111111111111', '1 Pound', 1, 1000, 1, true),
  ('33333333-3333-4333-8333-222222222222', '2 Pounds', 2, 2000, 2, true),
  ('33333333-3333-4333-8333-333333333333', '3 Pounds', 3, 3000, 3, true)
on conflict (pounds) do nothing;

insert into public.decoration_options (id, name, description, charge, sort_order, is_active)
values
  (
    '44444444-4444-4444-8444-111111111111',
    'Classic finish',
    'Neat buttercream finish with a simple message.',
    0,
    1,
    true
  ),
  (
    '44444444-4444-4444-8444-222222222222',
    'Piped borders & florals',
    'Hand-piped details and delicate buttercream flowers.',
    500,
    2,
    true
  ),
  (
    '44444444-4444-4444-8444-333333333333',
    'Premium designer finish',
    'Custom palette, gold accents and a fully styled design.',
    1200,
    3,
    true
  )
on conflict (id) do nothing;

insert into public.products (
  id, category_id, name, slug, description, price, pricing_type, image_url,
  flavor, is_featured, is_active, sort_order
)
values
  (
    '22222222-2222-4222-8222-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Oreo Cake',
    'oreo-cake',
    'Deep chocolate sponge layered with cookies-and-cream buttercream and a generous Oreo crumb finish.',
    1100,
    'per_pound',
    '/images/oreo-cake.jpg',
    'Cookies & cream',
    true,
    true,
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'Chocolate Cake',
    'chocolate-cake',
    'Our classic, deeply chocolatey cake with soft cocoa sponge and velvety chocolate ganache.',
    1100,
    'per_pound',
    '/images/chocolate-cake.jpg',
    'Rich chocolate',
    true,
    true,
    2
  ),
  (
    '22222222-2222-4222-8222-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'Chocolate Fudge Cake',
    'chocolate-fudge-cake',
    'Extra indulgent chocolate fudge layers, glossy ganache and a rich fudge centre.',
    1300,
    'per_pound',
    '/images/chocolate-fudge.jpg',
    'Chocolate fudge',
    true,
    true,
    3
  ),
  (
    '22222222-2222-4222-8222-444444444444',
    '11111111-1111-4111-8111-111111111111',
    'Vanilla Cake',
    'vanilla-cake',
    'Light vanilla sponge with vanilla bean buttercream and a delicate, clean finish.',
    1100,
    'per_pound',
    '/images/vanilla-cake.jpg',
    'Vanilla bean',
    true,
    true,
    4
  ),
  (
    '22222222-2222-4222-8222-555555555555',
    '11111111-1111-4111-8111-222222222222',
    'Pineapple Cake',
    'pineapple-cake',
    'Fluffy sponge, whipped cream and juicy pineapple pieces — a fresh, light favourite.',
    1200,
    'per_pound',
    '/images/pineapple-cake.jpg',
    'Pineapple cream',
    true,
    true,
    5
  ),
  (
    '22222222-2222-4222-8222-666666666666',
    '11111111-1111-4111-8111-222222222222',
    'Red Velvet Cake',
    'red-velvet-cake',
    'Classic red velvet with a tender crumb and luscious cream cheese frosting.',
    1250,
    'per_pound',
    '/images/red-velvet.jpg',
    'Red velvet',
    true,
    true,
    6
  ),
  (
    '22222222-2222-4222-8222-777777777777',
    '11111111-1111-4111-8111-333333333333',
    'Small Glass Cake',
    'small-glass-cake',
    'A pretty little layered cake in a glass jar, perfect for a personal treat.',
    100,
    'fixed',
    '/images/glass-cake.jpg',
    null,
    false,
    true,
    7
  ),
  (
    '22222222-2222-4222-8222-888888888888',
    '11111111-1111-4111-8111-333333333333',
    'Large Glass Cake',
    'large-glass-cake',
    'Our larger glass cake, generously layered and finished with a sweet topping.',
    250,
    'fixed',
    '/images/glass-cake.jpg',
    null,
    false,
    true,
    8
  ),
  (
    '22222222-2222-4222-8222-999999999999',
    '11111111-1111-4111-8111-333333333333',
    'Cupcakes',
    'cupcakes',
    'Soft, moist cupcakes with a swirl of buttercream. Sold individually.',
    70,
    'fixed',
    '/images/cupcakes.jpg',
    null,
    false,
    true,
    9
  ),
  (
    '22222222-2222-4222-8222-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-333333333333',
    'Pastries',
    'pastries',
    'Buttery, flaky pastries baked in small batches through the day.',
    150,
    'fixed',
    '/images/pastries.jpg',
    null,
    false,
    true,
    10
  )
on conflict (slug) do nothing;

insert into public.deals (
  id, title, slug, description, code, discount_type, discount_value,
  minimum_order, image_url, starts_at, ends_at, is_active
)
values
  (
    '55555555-5555-4555-8555-111111111111',
    'A little sweeter weekend',
    'sweet-weekend',
    'Take 10% off cake orders of Rs. 2,500 or more. Perfect for sharing something special.',
    'SWEET10',
    'percentage',
    10,
    2500,
    '/images/birthday-cake.jpg',
    null,
    null,
    true
  ),
  (
    '55555555-5555-4555-8555-222222222222',
    'Cupcake party box',
    'cupcake-party-box',
    'Order one dozen cupcakes and save Rs. 100. A cheerful treat for offices and classrooms.',
    'CUPCAKE100',
    'fixed',
    100,
    840,
    '/images/cupcakes.jpg',
    null,
    null,
    true
  )
on conflict (slug) do nothing;

insert into public.business_settings (
  id, business_name, tagline, address, phone, whatsapp, email,
  delivery_charge, free_delivery_threshold, minimum_order, profit_per_pound,
  payment_methods, opening_hours, announcement, map_embed_url
)
values (
  '99999999-9999-4999-8999-111111111111',
  'Laiba Bakes',
  'Baked with love, made for your moments.',
  '10 Civil Lines, Near Police Lines, Dera Ismail Khan, Pakistan',
  '0300-5477201',
  '0300-5477201',
  'gullaiba049@gmail.com',
  200,
  5000,
  500,
  100,
  array['Cash on delivery', 'Cash on pickup', 'Bank transfer'],
  'Daily, 10:00 AM – 10:00 PM',
  'Freshly baked daily in Dera Ismail Khan · Custom cakes available 48 hours in advance',
  'https://www.google.com/maps?q=10+Civil+Lines,+Near+Police+Lines,+Dera+Ismail+Khan,+Pakistan&output=embed'
)
on conflict do nothing;
