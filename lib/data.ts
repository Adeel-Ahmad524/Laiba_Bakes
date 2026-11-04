import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
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
} from "./types";
import { safeNumber } from "./utils";

function normalizeProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    price: safeNumber(row.price),
    sort_order: safeNumber(row.sort_order),
    category:
      (row.category as Product["category"]) ??
      (row.categories as Product["category"]) ??
      null,
  };
}

export const getSettings = cache(async (): Promise<BusinessSettings> => {
  if (!isSupabaseConfigured) return fallbackSettings;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error || !data) return fallbackSettings;
    return {
      ...fallbackSettings,
      ...(data as BusinessSettings),
      delivery_charge: safeNumber(data.delivery_charge),
      free_delivery_threshold: safeNumber(data.free_delivery_threshold),
      minimum_order: safeNumber(data.minimum_order),
      profit_per_pound: safeNumber(data.profit_per_pound),
      payment_methods: Array.isArray(data.payment_methods)
        ? data.payment_methods
        : fallbackSettings.payment_methods,
    };
  } catch (error) {
    console.error("getSettings failed, using fallbacks:", error);
    return fallbackSettings;
  }
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return fallbackCategories;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) return fallbackCategories;
    if (!data) return [];
    return data as Category[];
  } catch {
    return fallbackCategories;
  }
});

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return fallbackProducts;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return fallbackProducts;
    if (!data) return [];
    return data.map((row) => normalizeProduct(row));
  } catch {
    return fallbackProducts;
  }
});

export const getCakeSizes = cache(async (): Promise<CakeSize[]> => {
  if (!isSupabaseConfigured) return fallbackCakeSizes;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("cake_sizes")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) return fallbackCakeSizes;
    if (!data) return [];
    return data.map((size) => ({
      ...(size as CakeSize),
      pounds: safeNumber(size.pounds, 1),
      reference_price: safeNumber(size.reference_price),
    }));
  } catch {
    return fallbackCakeSizes;
  }
});

export const getDecorations = cache(async (): Promise<DecorationOption[]> => {
  if (!isSupabaseConfigured) return fallbackDecorations;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("decoration_options")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) return fallbackDecorations;
    if (!data) return [];
    return data.map((option) => ({
      ...(option as DecorationOption),
      charge: safeNumber(option.charge),
    }));
  } catch {
    return fallbackDecorations;
  }
});

export const getDeals = cache(async (): Promise<Deal[]> => {
  if (!isSupabaseConfigured) return fallbackDeals;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) return fallbackDeals;
    if (!data) return [];
    const now = Date.now();
    return (data as Deal[])
      .filter((deal) => !deal.starts_at || new Date(deal.starts_at).getTime() <= now)
      .filter((deal) => !deal.ends_at || new Date(deal.ends_at).getTime() >= now)
      .map((deal) => ({
        ...deal,
        discount_value: safeNumber(deal.discount_value),
        minimum_order: safeNumber(deal.minimum_order),
      }));
  } catch {
    return fallbackDeals;
  }
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
});
