# Laiba Bakes

A complete bakery website for **Laiba Bakes**, Dera Ismail Khan. Customers can browse the cake catalogue, build a custom cake, place an order without registering, pay on delivery/pickup and contact the bakery. Orders and messages are delivered by email through **Formspree** — there is no database, admin dashboard or customer account system.

- **Business:** Laiba Bakes
- **Address:** 10 Civil Lines, Near Police Lines, Dera Ismail Khan, Pakistan
- **Phone / WhatsApp:** 0300-5477201
- **Email:** gullaiba049@gmail.com
- **Currency:** PKR
- **Order form:** <https://formspree.io/f/mljjaljk>

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
| `/contact` | Contact details, map, click-to-call/WhatsApp/email and contact form |
| `/order` | Checkout: customer details, delivery/pickup, cake details, reference upload, payment, coupon and summary |
| `/order/success` | Order confirmation with order ID, summary and WhatsApp confirmation link |

Every public page uses the shared header, footer and floating WhatsApp button.

### Order workflow

1. Customer adds products to the basket.
2. Customer completes the checkout form.
3. Prices are recalculated **on the server** from the built-in catalogue.
4. The validated order is sent to Formspree, which emails it to the bakery.
5. The confirmation page shows the order ID, total and order details.
6. The customer may open WhatsApp to confirm; **opening WhatsApp never confirms an order automatically**.
7. The bakery reviews the request and contacts the customer manually.

There is no customer login, order history or status tracking page. The bakery confirms every order personally.

---

## 2. Technology

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- Formspree for order and contact submissions
- Server Actions for all writes
- Zod validation
- Vitest for pricing, utility and validation tests
- `lucide-react` icons and `sonner` toasts

No database, ORM, authentication provider or file-storage service is required.

---

## 3. Local setup

### Requirements

- Node.js 20 or newer (Node 22/24 LTS recommended)
- npm 10+

### Install

```bash
npm install
```

### Environment variables

Environment variables are optional. The site works without a `.env.local` file because the Formspree endpoint is built in.

To customise the public URL or use a different Formspree form, copy the template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# FORMSPREE_ENDPOINT=https://formspree.io/f/mljjaljk
```

| Variable | Where it is used | Safe to expose? |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Metadata and canonical links | Yes |
| `FORMSPREE_ENDPOINT` | Server-side order/contact submissions | No (server only) |

### Run the site

```bash
npm run dev
```

- Website: <http://localhost:3000>

### Catalogue and business settings

The catalogue is built in and lives in `lib/fallback-data.ts`. Edit that file to change:

- Categories, products, flavours and prices
- Cake sizes and reference prices
- Decoration finishes and charges
- Deals, coupon codes and minimum orders
- Business details, delivery charges and payment methods

Changes are picked up on the next request; no migration or seed step is needed.

---

## 4. Formspree setup

The default endpoint is `https://formspree.io/f/mljjaljk`.

1. Sign in at <https://formspree.io>.
2. Open the form and confirm the notification email address.
3. Submit a test order from `/order` and check that the email arrives.
4. File uploads (the optional reference image) require a Formspree plan that includes file uploads. If the plan does not support them, the order is still sent without the attachment and the confirmation page asks the customer to send the picture on WhatsApp.

Formspree field names used by the order form include `order_number`, `name`, `phone`, `whatsapp`, `email`, `delivery_type`, `address`, `required_date`, `required_time`, `payment_method`, `items`, `total`, `cake_colour`, `cake_message`, `design_description` and `special_instructions`. The attachment field is named `attachment`.

Contact messages use the same endpoint with `form_type: "contact"`.

---

## 5. Testing

```bash
npm run test        # pricing, utility and validation tests
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
- Order and contact form validation

### Manual acceptance checklist

1. Visit every navigation page on mobile and desktop.
2. Add a 2 lb Chocolate Fudge Cake to the basket and confirm the price is `2 × Rs. 1,300`, not `2 × 1,300 + 2,000`.
3. Add cupcakes and confirm they use the fixed quantity price.
4. Complete a delivery order and a pickup order.
5. Confirm both orders arrive by email through Formspree.
6. Confirm the confirmation page shows the order ID and totals.
7. Upload a reference image and confirm it is attached when the Formspree plan supports it.
8. Confirm the order still sends when the attachment is rejected, and the page asks for the picture on WhatsApp.
9. Send a contact message and confirm it arrives by email.
10. Confirm opening WhatsApp does not change or confirm the order.
11. Confirm profit figures never appear on any public page.

---

## 6. Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Optionally add `NEXT_PUBLIC_SITE_URL` (for example `https://laibabakes.com`) in **Vercel → Project → Settings → Environment Variables**.
4. Deploy. The framework preset is Next.js; no custom build command is needed (`npm run build`).
5. Submit a test order on the deployed domain and confirm the Formspree email arrives.

No database migrations, storage buckets or authentication settings are required.

---

## 7. Security notes

- Order totals, discounts and delivery charges are recomputed on the server; client-submitted totals are ignored.
- The Formspree endpoint is called from a server action, not exposed as a client-side fetch target.
- Uploads are validated by size, MIME type and file signature before being forwarded.
- Order and contact actions include a honeypot field and in-memory rate limiting.
- WhatsApp is a communication channel only. It never confirms an order automatically.
- The private profit target is excluded from public settings and is not sent to Formspree.

---

## 8. Pricing model

```
Line total (per pound) = flavour price per lb × pounds × quantity
Line total (fixed)     = unit price × quantity
Subtotal               = cake lines + fixed lines
Total                  = subtotal + decoration charge + delivery − discount
Estimated profit       = total pounds × profit per pound
```

The size reference prices (`1 lb = Rs. 1,000`, `2 lb = Rs. 2,000`, `3 lb = Rs. 3,000`) are display/reference values only. They are **never** added to the flavour-specific per-pound price.

The estimated profit is a private business estimate and is never shown to customers or included in Formspree emails.

---

## 9. Project structure

```text
app/
  (site)/                 Public website routes
  actions/                Server actions (orders, contact)
  layout.tsx              Root layout, fonts, toasts
  not-found.tsx           404 page
components/
  site/                   Header, footer, cart, checkout, product UI
lib/
  data.ts                 Built-in catalogue/settings reads
  fallback-data.ts        Catalogue, deals and business settings
  formspree.ts            Formspree submission helper
  pricing.ts              Authoritative pricing and profit logic
  validation.ts           Zod schemas
  rate-limit.ts           In-memory form rate limiting
tests/                    Vitest suites
```

---

## 10. Common tasks

### Change a product price

Edit `lib/fallback-data.ts` → update the product's `price`. The storefront and checkout use the new price immediately.

### Add a product

Add an entry to `fallbackProducts` in `lib/fallback-data.ts`. Choose `per_pound` for cakes and `fixed` for cupcakes, pastries and glass cakes.

### Create a coupon

Add an entry to `fallbackDeals` in `lib/fallback-data.ts`. Set a `code` (e.g. `SWEET10`), discount type/value, optional minimum order and validity dates.

### Change delivery charges

Edit `fallbackSettings` in `lib/fallback-data.ts`. Update `delivery_charge`, `free_delivery_threshold` and `minimum_order`.

### Update contact details

Edit `fallbackSettings` in `lib/fallback-data.ts`. Changes appear in the header, footer, contact page and WhatsApp links.

---

## 11. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Order form says it could not send | Check the Formspree form is active and the endpoint in `lib/formspree.ts` (or `FORMSPREE_ENDPOINT`) is correct. |
| No order email arrives | Check the Formspree notification address and spam folder; confirm the form is activated. |
| Reference image is missing from the email | File uploads need a Formspree plan that supports them. The order is still sent; ask the customer to send the picture on WhatsApp. |
| Build fails after removing dependencies | Run `npm install` again so `package-lock.json` matches `package.json`. |

---

## 12. Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build and type-check |
| `npm run start` | Start the production server |
| `npm run lint` | Next.js lint |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

---

Built for Laiba Bakes — baked with love, made for your moments.
