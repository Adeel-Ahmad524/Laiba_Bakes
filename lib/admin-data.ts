import "server-only";

import { createSupabaseAdminClient } from "./supabase/admin";
import type {
  BusinessSettings,
  CakeSize,
  Category,
  ContactMessage,
  Customization,
  Deal,
  DecorationOption,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from "./types";
import { fallbackSettings } from "./fallback-data";
import { safeNumber } from "./utils";

export interface AdminOrder extends Order {
  customer: NonNullable<Order["customer"]>;
}

export async function getAdminProducts() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getAdminProduct(id: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("id", id)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export async function getAdminCategories() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function getAdminCategory(id: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("categories").select("*").eq("id", id).maybeSingle();
  return (data as Category | null) ?? null;
}

export async function getAdminDeals() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Deal[];
}

export async function getAdminDeal(id: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("deals").select("*").eq("id", id).maybeSingle();
  return (data as Deal | null) ?? null;
}

export async function getAdminOrders(filters?: {
  status?: string;
  q?: string;
}) {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("orders")
    .select("*, customer:customers(*)")
    .order("created_at", { ascending: false })
    .limit(250);

  if (
    filters?.status &&
    [
      "new",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ].includes(filters.status)
  ) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let orders = (data ?? []) as AdminOrder[];
  const search = filters?.q?.trim().toLowerCase();
  if (search) {
    orders = orders.filter((order) => {
      return (
        order.order_number.toLowerCase().includes(search) ||
        order.customer?.name?.toLowerCase().includes(search) ||
        order.customer?.phone?.includes(search) ||
        order.customer?.email?.toLowerCase().includes(search)
      );
    });
  }
  return orders;
}

export async function getAdminOrderById(id: string) {
  const admin = createSupabaseAdminClient();
  const [{ data: order }, { data: items }, { data: customization }] =
    await Promise.all([
      admin.from("orders").select("*, customer:customers(*)").eq("id", id).maybeSingle(),
      admin.from("order_items").select("*").eq("order_id", id).order("created_at"),
      admin.from("customizations").select("*").eq("order_id", id).maybeSingle(),
    ]);

  if (!order) return null;

  let referenceSignedUrl: string | null = null;
  if (order.reference_image_path) {
    const { data: signed } = await admin.storage
      .from("cake-references")
      .createSignedUrl(order.reference_image_path, 60 * 60);
    referenceSignedUrl = signed?.signedUrl ?? null;
  }

  return {
    order: order as AdminOrder,
    items: (items ?? []) as OrderItem[],
    customization: (customization as Customization | null) ?? null,
    referenceSignedUrl,
  };
}

export async function getAdminMessages() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

export async function getAdminSettings(): Promise<BusinessSettings> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("business_settings")
    .select("*")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!data) return fallbackSettings;
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
}

export async function getAdminSizes() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("cake_sizes")
    .select("*")
    .order("sort_order", { ascending: true });
  return ((data ?? []) as CakeSize[]).map((size) => ({
    ...size,
    pounds: safeNumber(size.pounds, 1),
    reference_price: safeNumber(size.reference_price),
  }));
}

export async function getAdminDecorations() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("decoration_options")
    .select("*")
    .order("sort_order", { ascending: true });
  return ((data ?? []) as DecorationOption[]).map((option) => ({
    ...option,
    charge: safeNumber(option.charge),
  }));
}

export async function getAdminDashboard() {
  const admin = createSupabaseAdminClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: newOrders },
    { count: productCount },
    { count: customerCount },
    { count: newMessages },
    { data: monthOrders },
    { data: recentOrders },
    { data: chartOrders },
  ] = await Promise.all([
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }).eq("status", "new"),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("customers").select("*", { count: "exact", head: true }),
    admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    admin
      .from("orders")
      .select("total, status, estimated_profit, created_at")
      .gte("created_at", monthStart.toISOString())
      .neq("status", "cancelled"),
    admin
      .from("orders")
      .select("*, customer:customers(*)")
      .order("created_at", { ascending: false })
      .limit(7),
    admin
      .from("orders")
      .select("total, status, created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .neq("status", "cancelled"),
  ]);

  const monthRevenue = (monthOrders ?? []).reduce(
    (sum, order) => sum + safeNumber(order.total),
    0,
  );
  const monthProfit = (monthOrders ?? []).reduce(
    (sum, order) => sum + safeNumber(order.estimated_profit),
    0,
  );

  const months: Array<{ label: string; value: number }> = [];
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index, 1);
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    const value = (chartOrders ?? [])
      .filter((order) => {
        const created = new Date(order.created_at);
        return created >= date && created < next;
      })
      .reduce((sum, order) => sum + safeNumber(order.total), 0);
    months.push({
      label: new Intl.DateTimeFormat("en-PK", { month: "short" }).format(date),
      value,
    });
  }

  return {
    totalOrders: totalOrders ?? 0,
    newOrders: newOrders ?? 0,
    productCount: productCount ?? 0,
    customerCount: customerCount ?? 0,
    newMessages: newMessages ?? 0,
    monthRevenue,
    monthProfit,
    recentOrders: (recentOrders ?? []) as AdminOrder[],
    months,
  };
}

export async function getSalesReport(days: number) {
  const admin = createSupabaseAdminClient();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false });

  const validOrders = ((orders ?? []) as Order[]).filter(
    (order) => order.status !== "cancelled",
  );
  const orderIds = validOrders.map((order) => order.id);
  let items: OrderItem[] = [];
  if (orderIds.length > 0) {
    const { data } = await admin
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);
    items = (data ?? []) as OrderItem[];
  }

  const revenue = validOrders.reduce((sum, order) => sum + safeNumber(order.total), 0);
  const profit = validOrders.reduce(
    (sum, order) => sum + safeNumber(order.estimated_profit),
    0,
  );
  const deliveryFees = validOrders.reduce(
    (sum, order) => sum + safeNumber(order.delivery_charge),
    0,
  );
  const discounts = validOrders.reduce(
    (sum, order) => sum + safeNumber(order.discount),
    0,
  );

  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const item of items) {
    const existing = productMap.get(item.product_name) ?? {
      name: item.product_name,
      quantity: 0,
      revenue: 0,
    };
    existing.quantity += item.quantity;
    existing.revenue += safeNumber(item.line_total);
    productMap.set(item.product_name, existing);
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const statusCounts = new Map<OrderStatus, number>();
  for (const order of validOrders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
  }

  return {
    orders: validOrders,
    revenue,
    profit,
    deliveryFees,
    discounts,
    averageOrder: validOrders.length ? revenue / validOrders.length : 0,
    topProducts,
    statusCounts: Array.from(statusCounts.entries()),
  };
}
