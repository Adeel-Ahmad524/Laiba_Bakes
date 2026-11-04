# Laiba Bakes

A complete, production-ready bakery website for **Laiba Bakes**, Dera Ismail Khan. Customers can browse the cake catalogue, build a custom cake, place an order without registering, pay on delivery/pickup, track an order securely, and contact the bakery. Administrators get a protected dashboard for products, categories, prices, orders, deals, messages, reports, profit estimates and business settings.

- **Business:** Laiba Bakes
- **Address:** 10 Civil Lines, Near Police Lines, Dera Ismail Khan, Pakistan
- **Phone / WhatsApp:** 0300-5477201
- **Email:** gullaiba049@gmail.com
- **Currency:** PKR

---

## 1. What is included

### Public website

| Route | Purpose |
| --- | --- |
| `/` | Home page with featured cakes, story, offers and ordering calls to action |
| `/cakes` | Full product catalogue with category and search filters |
| `/cakes/[slug]` | Product detail page with size selection, live price and basket actions |
| `/categories` | Cake category collections |
| `/deals` | Active special deals and coupon codes |
| `/custom-cakes` | Custom cake builder with design details and WhatsApp hand-off |
| `/about` | Bakery story and values |
| `/my-orders` | Secure order tracking using order ID + phone number |
| `/contact` | Contact details, map, click-to-call/WhatsApp/email and contact form |
| `/order` | Checkout: customer details, delivery/pickup, cake details, reference upload, payment, coupon and summary |
| `/order/success?token=…` | Order confirmation with order ID, totals and WhatsApp confirmation link |
| `/admin/login` | Administrator sign-in |
| `/admin` | Protected dashboard |

Every public page uses the shared header, footer and floating WhatsApp button.

### Admin dashboard

- Overview with monthly revenue, private estimated profit, new orders, new messages and recent orders
- Orders list with status filters and search by order number, name, phone or email
- Order detail with customer contact links, items, design details, private reference image, totals, profit estimate, status/payment updates and internal notes
- Products CRUD with image upload, pricing type, category, flavour, featured/hidden state and sort order
- Categories CRUD with image upload
- Deals CRUD with coupon codes, percentage/fixed discounts, minimum order, validity dates and image upload
- Contact messages inbox with reply, read/replied states and delete
- Sales & profit reports for 7/30/90/365 days with best sellers and status breakdown
- Business settings: contact details, delivery charge, free-delivery threshold, minimum order, profit per pound, payment methods, announcement, map and social links
- Cake size reference prices and decoration finishes managed from settings

### Order workflow

1. Customer adds products to the basket.
2. Customer completes the checkout form.
3. Prices are recalculated **on the server** from database prices.
4. The order is saved to Supabase with a unique order number (`LB-YYMMDD-XXXXXX`).
5. The confirmation page shows the order details and order ID.
6. The customer may open WhatsApp to confirm; **opening WhatsApp never changes the order status**.
7. The admin reviews the order and changes the status manually:
   `New → Confirmed → Preparing → Ready for Pickup / Out for Delivery → Delivered`, or `Cancelled`.

Customers can track an order from `/my-orders` by entering the order ID and the phone number used at checkout. Both values are verified on the server. Only that order is returned.

---

## 2. Technology

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- Supabase PostgreSQL, Auth and Storage
- Server Actions for all writes
- Zod validation
- Vitest for pricing, utility and validation tests
- `lucide-react` icons and `sonner` toasts

---

## 3. Local setup

### Requirements

- Node.js 20 or newer (Node 22/24 LTS recommended)
- npm 10+
- A Supabase project (free tier is enough)

### Install

```bash
npm install
```

### Environment variables

Copy the template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the values from **Supabase → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Variable | Where it is used | Safe to expose? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server Supabase clients | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server Supabase clients (RLS applies) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server actions and admin queries only | **Never** |
| `NEXT_PUBLIC_SITE_URL` | Metadata, canonical links | Yes |

Never prefix the service role key with `NEXT_PUBLIC_`. Never commit `.env.local`.

### Database migrations

The SQL files are in `supabase/migrations/`:

1. `20261103090000_initial_schema.sql` — tables, indexes, triggers, RLS policies and storage buckets
2. `20261103090100_seed_catalogue.sql` — initial categories, products, sizes, decorations, deals and business settings

**Option A — Supabase CLI (recommended)**

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

**Option B — SQL editor**

Open the Supabase SQL editor and run the two migration files in order.

The migration creates:

- Tables: `admin_users`, `categories`, `products`, `cake_sizes`, `decoration_options`, `deals`, `customers`, `orders`, `order_items`, `customizations`, `contact_messages`, `business_settings`
- Primary keys, foreign keys and indexes
- Row Level Security on every table
- Private `cake-references` bucket and public `product-images` bucket

### Create the first administrator

The admin account needs a Supabase Auth user **and** a row in `admin_users`. Use the included script:

```bash
npm run create-admin -- admin@example.com "a-strong-password" "Laiba"
```

Or set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` in `.env.local` and run:

```bash
npm run create-admin
```

The script creates/updates a confirmed auth user and upserts the `admin_users` profile. If the email already exists, it promotes that user and updates the password.

### Run the site

```bash
npm run dev
```

- Website: <http://localhost:3000>
- Admin: <http://localhost:3000/admin/login>

### Fallback catalogue

If Supabase environment variables are missing, the public site uses a read-only fallback catalogue from `lib/fallback-data.ts` so it still renders. Ordering, contact submissions and admin login return a clear “setup required” message until Supabase is configured. Once configured, all catalogue data comes from Supabase.

---

## 4. Testing

```bash
npm run test        # 42 unit tests: pricing, utilities, validation
npm run build       # production type-check + build
```

The tests cover:

- Per-pound pricing (flavour price × pounds × quantity)
- Size reference prices never being added to flavour prices
- Fixed-price products ignoring pounds
- Delivery charges, free-delivery threshold and pickup
- Percentage/fixed discounts and minimum order rules
- Order totals and profit estimates
- Phone normalisation and formatting
- Order/contact/admin form validation

### Manual acceptance checklist

1. Visit every navigation page on mobile and desktop.
2. Add a 2 lb Chocolate Fudge Cake to the basket and confirm the price is `2 × Rs. 1,300`, not `2 × 1,300 + 2,000`.
3. Add cupcakes and confirm they use the fixed quantity price.
4. Complete a delivery order and a pickup order.
5. Confirm the order appears in Supabase `orders`, `order_items` and `customizations`.
6. Confirm the confirmation page shows the order ID and totals.
7. Open `/my-orders`, enter the order ID and phone number; confirm only that order appears.
8. Enter a different phone number; confirm the lookup fails.
9. Upload a reference image and confirm it is stored privately in `cake-references`.
10. Send a contact message and confirm it appears in `/admin/messages`.
11. Sign in at `/admin/login`; confirm `/admin` is inaccessible when signed out.
12. Create/edit/delete a product, category and deal; upload images.
13. Change an order status and payment status from the admin order detail page.
14. Change delivery charges and profit per pound in settings; confirm new orders use them.
15. Confirm profit figures never appear on any public page.
16. Confirm opening WhatsApp does not change the order status.

---

## 5. Deployment (Vercel + Supabase)

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the four environment variables in **Vercel → Project → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://laibabakes.com`)
4. Deploy. The framework preset is Next.js; no custom build command is needed (`npm run build`).
5. In Supabase **Authentication → URL Configuration**, set the Site URL to your production domain and add it to the redirect allow-list.
6. Run the migrations against the production Supabase project if you have not already.
7. Create the production administrator with `npm run create-admin -- …` using the production environment variables.
8. Test the public order flow and admin login on the deployed domain.

### Backups

Enable Supabase’s scheduled backups (or a paid plan with point-in-time recovery). Before large catalogue changes, export the affected tables from the Supabase dashboard.

---

## 6. Security notes

- Admin routes are protected twice: middleware checks the Supabase session and `admin_users` membership, and every admin page/layout/server action calls `requireAdmin()`.
- RLS is enabled on every table. Public users can read only active catalogue rows and public business settings. Customer, order and message data are not readable by anonymous users.
- All writes go through server actions. The service role key is imported only by `lib/supabase/admin.ts`, which is marked `server-only`.
- Order totals, discounts, delivery charges and profit are recomputed on the server; client-submitted totals are ignored.
- Order lookup requires the order number **and** the normalised phone number. Errors do not reveal whether the order or the phone number was wrong.
- Uploads are validated by size, MIME type and file signature. Product images are public; cake references are private and served to admins through one-hour signed URLs.
- Contact and order actions include a honeypot field and in-memory rate limiting.
- WhatsApp is a communication channel only. It never confirms an order automatically.

---

## 7. Pricing model

```
Line total (per pound) = flavour price per lb × pounds × quantity
Line total (fixed)     = unit price × quantity
Subtotal               = cake lines + fixed lines
Total                  = subtotal + decoration charge + delivery − discount
Estimated profit       = total pounds × profit per pound
```

The size reference prices (`1 lb = Rs. 1,000`, `2 lb = Rs. 2,000`, `3 lb = Rs. 3,000`) are display/reference values only. They are **never** added to the flavour-specific per-pound price.

The estimated profit is a private admin estimate, not verified net profit. It is never shown to customers.

---

## 8. Project structure

```text
app/
  (site)/                 Public website routes
  admin/(dashboard)/      Protected admin pages
  admin/login/            Admin sign-in
  actions/                Server actions (auth, orders, contact, admin)
  layout.tsx              Root layout, fonts, toasts
  not-found.tsx           404 page
components/
  admin/                  Admin shell, forms, UI helpers
  site/                   Header, footer, cart, checkout, product UI
lib/
  supabase/               Browser/server/admin clients and middleware
  admin-data.ts           Admin queries
  data.ts                 Public catalogue/settings queries
  pricing.ts              Authoritative pricing and profit logic
  validation.ts           Zod schemas
  uploads.ts              Storage upload validation
  fallback-data.ts        Read-only fallback catalogue
supabase/migrations/      Schema/RLS and seed SQL
scripts/create-admin.ts   Admin account bootstrap
tests/                    Vitest suites
```

> Note: a separate `laiba-bakes/` scaffold folder exists in the repository from an earlier attempt. It is excluded from this project’s TypeScript build and is not used by the application at the repository root.

---

## 9. Common tasks

### Change a product price

Admin → Products → edit the product → update **Price**. The storefront and checkout use the new price immediately.

### Add a product with a photo

Admin → Products → Add product. Upload a JPG/PNG/WebP up to 5 MB, or paste an image URL. Choose **Per pound** for cakes and **Fixed price** for cupcakes, pastries and glass cakes.

### Create a coupon

Admin → Deals → Add deal. Set a code (e.g. `SWEET10`), discount type/value, optional minimum order and validity dates. Customers enter the code at checkout.

### Change delivery charges

Admin → Settings → Orders & pricing. Update delivery charge, free-delivery threshold, minimum order and profit per pound.

### Update contact details

Admin → Settings → Business details. Changes appear in the header, footer, contact page and WhatsApp links.

---

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| “Online ordering is being set up” | Add the Supabase variables to `.env.local` and restart the dev server. |
| Admin login says Supabase is not configured | Both `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` must be set. |
| Admin login works but `/admin` redirects back | Run the `admin_users` migration and create the admin with `npm run create-admin`. |
| Image upload fails | Check that the storage buckets exist and the service role key is correct. |
| “new row violates row-level security” | Run the full migration; RLS policies and grants must be applied. |
| Orders submit but no email arrives | This project does not send transactional email. Contact the customer from the admin order page via WhatsApp/phone. |
| Build fails on `/admin` prerender | Admin pages must stay dynamic; the layout sets `dynamic = "force-dynamic"`. |

---

## 11. Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build and type-check |
| `npm run start` | Start the production server |
| `npm run lint` | Next.js lint |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run create-admin` | Create/promote an administrator |

---

Built for Laiba Bakes — baked with love, made for your moments.
