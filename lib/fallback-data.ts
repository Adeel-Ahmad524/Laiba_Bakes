import type {
  BusinessSettings,
  CakeSize,
  Category,
  Deal,
  DecorationOption,
  Product,
} from "./types";

/**
 * The built-in catalogue and business settings. There is no database, so these
 * records are the single source of truth for the public website and checkout.
 * Edit this file to change products, prices, sizes, decorations or deals.
 */
export const fallbackCategories: Category[] = [
  {
    id: "cat-signature",
    name: "Signature Cakes",
    slug: "signature-cakes",
    description:
      "Our most-loved flavours, baked fresh to order with silky frosting and premium ingredients.",
    image_url: "/images/chocolate-cake.jpg",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "cat-celebration",
    name: "Celebration Cakes",
    slug: "celebration-cakes",
    description:
      "Show-stopping centrepieces for birthdays, weddings, anniversaries and every happy occasion.",
    image_url: "/images/custom-cake.jpg",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "cat-treats",
    name: "Little Treats",
    slug: "little-treats",
    description:
      "Glass cakes, cupcakes and pastries for a sweet little something whenever you need it.",
    image_url: "/images/cupcakes.jpg",
    sort_order: 3,
    is_active: true,
  },
];

export const fallbackCakeSizes: CakeSize[] = [
  {
    id: "size-1",
    label: "1 Pound",
    pounds: 1,
    reference_price: 1000,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "size-2",
    label: "2 Pounds",
    pounds: 2,
    reference_price: 2000,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "size-3",
    label: "3 Pounds",
    pounds: 3,
    reference_price: 3000,
    sort_order: 3,
    is_active: true,
  },
];

export const fallbackDecorations: DecorationOption[] = [
  {
    id: "deco-classic",
    name: "Classic finish",
    description: "Neat buttercream finish with a simple message.",
    charge: 0,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "deco-piped",
    name: "Piped borders & florals",
    description: "Hand-piped details and delicate buttercream flowers.",
    charge: 500,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "deco-premium",
    name: "Premium designer finish",
    description: "Custom palette, gold accents and a fully styled design.",
    charge: 1200,
    sort_order: 3,
    is_active: true,
  },
];

export const fallbackProducts: Product[] = [
  {
    id: "prod-oreo",
    category_id: "cat-signature",
    name: "Oreo Cake",
    slug: "oreo-cake",
    description:
      "Deep chocolate sponge layered with cookies-and-cream buttercream and a generous Oreo crumb finish.",
    price: 1100,
    pricing_type: "per_pound",
    image_url: "/images/oreo-cake.jpg",
    flavor: "Cookies & cream",
    is_featured: true,
    is_active: true,
    sort_order: 1,
    category: { id: "cat-signature", name: "Signature Cakes", slug: "signature-cakes" },
  },
  {
    id: "prod-chocolate",
    category_id: "cat-signature",
    name: "Chocolate Cake",
    slug: "chocolate-cake",
    description:
      "Our classic, deeply chocolatey cake with soft cocoa sponge and velvety chocolate ganache.",
    price: 1100,
    pricing_type: "per_pound",
    image_url: "/images/chocolate-cake.jpg",
    flavor: "Rich chocolate",
    is_featured: true,
    is_active: true,
    sort_order: 2,
    category: { id: "cat-signature", name: "Signature Cakes", slug: "signature-cakes" },
  },
  {
    id: "prod-chocolate-fudge",
    category_id: "cat-signature",
    name: "Chocolate Fudge Cake",
    slug: "chocolate-fudge-cake",
    description:
      "Extra indulgent chocolate fudge layers, glossy ganache and a rich fudge centre.",
    price: 1300,
    pricing_type: "per_pound",
    image_url: "/images/chocolate-fudge.jpg",
    flavor: "Chocolate fudge",
    is_featured: true,
    is_active: true,
    sort_order: 3,
    category: { id: "cat-signature", name: "Signature Cakes", slug: "signature-cakes" },
  },
  {
    id: "prod-vanilla",
    category_id: "cat-signature",
    name: "Vanilla Cake",
    slug: "vanilla-cake",
    description:
      "Light vanilla sponge with vanilla bean buttercream and a delicate, clean finish.",
    price: 1100,
    pricing_type: "per_pound",
    image_url: "/images/vanilla-cake.jpg",
    flavor: "Vanilla bean",
    is_featured: true,
    is_active: true,
    sort_order: 4,
    category: { id: "cat-signature", name: "Signature Cakes", slug: "signature-cakes" },
  },
  {
    id: "prod-pineapple",
    category_id: "cat-celebration",
    name: "Pineapple Cake",
    slug: "pineapple-cake",
    description:
      "Fluffy sponge, whipped cream and juicy pineapple pieces — a fresh, light favourite.",
    price: 1200,
    pricing_type: "per_pound",
    image_url: "/images/pineapple-cake.jpg",
    flavor: "Pineapple cream",
    is_featured: true,
    is_active: true,
    sort_order: 5,
    category: { id: "cat-celebration", name: "Celebration Cakes", slug: "celebration-cakes" },
  },
  {
    id: "prod-red-velvet",
    category_id: "cat-celebration",
    name: "Red Velvet Cake",
    slug: "red-velvet-cake",
    description:
      "Classic red velvet with a tender crumb and luscious cream cheese frosting.",
    price: 1250,
    pricing_type: "per_pound",
    image_url: "/images/red-velvet.jpg",
    flavor: "Red velvet",
    is_featured: true,
    is_active: true,
    sort_order: 6,
    category: { id: "cat-celebration", name: "Celebration Cakes", slug: "celebration-cakes" },
  },
  {
    id: "prod-small-glass",
    category_id: "cat-treats",
    name: "Small Glass Cake",
    slug: "small-glass-cake",
    description:
      "A pretty little layered cake in a glass jar, perfect for a personal treat.",
    price: 100,
    pricing_type: "fixed",
    image_url: "/images/glass-cake.jpg",
    flavor: null,
    is_featured: false,
    is_active: true,
    sort_order: 7,
    category: { id: "cat-treats", name: "Little Treats", slug: "little-treats" },
  },
  {
    id: "prod-large-glass",
    category_id: "cat-treats",
    name: "Large Glass Cake",
    slug: "large-glass-cake",
    description:
      "Our larger glass cake, generously layered and finished with a sweet topping.",
    price: 250,
    pricing_type: "fixed",
    image_url: "/images/glass-cake.jpg",
    flavor: null,
    is_featured: false,
    is_active: true,
    sort_order: 8,
    category: { id: "cat-treats", name: "Little Treats", slug: "little-treats" },
  },
  {
    id: "prod-cupcakes",
    category_id: "cat-treats",
    name: "Cupcakes",
    slug: "cupcakes",
    description:
      "Soft, moist cupcakes with a swirl of buttercream. Sold individually.",
    price: 70,
    pricing_type: "fixed",
    image_url: "/images/cupcakes.jpg",
    flavor: null,
    is_featured: false,
    is_active: true,
    sort_order: 9,
    category: { id: "cat-treats", name: "Little Treats", slug: "little-treats" },
  },
  {
    id: "prod-pastries",
    category_id: "cat-treats",
    name: "Pastries",
    slug: "pastries",
    description:
      "Buttery, flaky pastries baked in small batches through the day.",
    price: 150,
    pricing_type: "fixed",
    image_url: "/images/pastries.jpg",
    flavor: null,
    is_featured: false,
    is_active: true,
    sort_order: 10,
    category: { id: "cat-treats", name: "Little Treats", slug: "little-treats" },
  },
];

export const fallbackDeals: Deal[] = [
  {
    id: "deal-sweet10",
    title: "A little sweeter weekend",
    slug: "sweet-weekend",
    description:
      "Take 10% off cake orders of Rs. 2,500 or more. Perfect for sharing something special.",
    code: "SWEET10",
    discount_type: "percentage",
    discount_value: 10,
    minimum_order: 2500,
    image_url: "/images/birthday-cake.jpg",
    starts_at: null,
    ends_at: null,
    is_active: true,
  },
  {
    id: "deal-cupcake-box",
    title: "Cupcake party box",
    slug: "cupcake-party-box",
    description:
      "Order one dozen cupcakes and save Rs. 100. A cheerful treat for offices and classrooms.",
    code: "CUPCAKE100",
    discount_type: "fixed",
    discount_value: 100,
    minimum_order: 840,
    image_url: "/images/cupcakes.jpg",
    starts_at: null,
    ends_at: null,
    is_active: true,
  },
];

export const fallbackSettings: BusinessSettings = {
  id: "fallback",
  business_name: "Laiba Bakes",
  tagline: "Baked with love, made for your moments.",
  address:
    "10 Civil Lines, Near Police Lines, Dera Ismail Khan, Pakistan",
  phone: "0300-5477207",
  whatsapp: "0300-5477207",
  email: "gullaiba049@gmail.com",
  delivery_charge: 200,
  free_delivery_threshold: 5000,
  minimum_order: 500,
  profit_per_pound: 100,
  payment_methods: ["Cash on delivery", "Cash on pickup", "Bank transfer"],
  opening_hours: "Daily, 10:00 AM – 10:00 PM",
  announcement:
    "Freshly baked daily in Dera Ismail Khan · Custom cakes available 48 hours in advance",
  map_embed_url:
    "https://www.google.com/maps?q=10+Civil+Lines,+Near+Police+Lines,+Dera+Ismail+Khan,+Pakistan&output=embed",
  instagram_url: null,
  facebook_url: null,
};
