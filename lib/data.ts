import "server-only";

import { cache } from "react";
import {
  fallbackCakeSizes,
  fallbackCategories,
  fallbackDeals,
  fallbackDecorations,
  fallbackProducts,
  fallbackSettings,
} from "./fallback-data";
import type {
  BusinessSettings,
  CakeSize,
  Category,
  Deal,
  DecorationOption,
  Product,
  PublicBusinessSettings,
} from "./types";

/**
 * The storefront catalogue lives in `lib/fallback-data.ts`. There is no
 * database: every read below is served from that built-in data, so the site
 * works with no environment variables and no external service.
 */
function toPublicSettings(settings: BusinessSettings): PublicBusinessSettings {
  const { profit_per_pound: _profitPerPound, ...publicSettings } = settings;
  return publicSettings;
}

export const getSettings = cache(
  async (): Promise<PublicBusinessSettings> => toPublicSettings(fallbackSettings),
);

/**
 * Full settings including the private profit target. Used only by the order
 * server action. Never pass this object to a Client Component.
 */
export const getOrderSettings = cache(
  async (): Promise<BusinessSettings> => fallbackSettings,
);

export const getCategories = cache(
  async (): Promise<Category[]> => fallbackCategories,
);

export const getProducts = cache(
  async (): Promise<Product[]> => fallbackProducts,
);

export const getCakeSizes = cache(
  async (): Promise<CakeSize[]> => fallbackCakeSizes,
);

export const getDecorations = cache(
  async (): Promise<DecorationOption[]> => fallbackDecorations,
);

export const getDeals = cache(async (): Promise<Deal[]> => {
  const now = Date.now();
  return fallbackDeals.filter((deal) => {
    if (!deal.is_active) return false;
    if (deal.starts_at && new Date(deal.starts_at).getTime() > now) return false;
    if (deal.ends_at && new Date(deal.ends_at).getTime() < now) return false;
    return true;
  });
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
});
