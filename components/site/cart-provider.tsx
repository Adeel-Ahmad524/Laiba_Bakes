"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";
import { calculateCartTotals } from "@/lib/pricing";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totals: ReturnType<typeof calculateCartTotals>;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "key"> & { key?: string }) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "laiba-bakes-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Corrupt storage is ignored rather than breaking the storefront.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or disabled; the in-memory cart still works.
    }
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = useCallback((item) => {
    const key =
      item.key ??
      `${item.productId}:${item.pricingType === "per_pound" ? (item.pounds ?? 1) : "fixed"}`;
    setItems((current) => {
      const existing = current.find((entry) => entry.key === key);
      if (existing) {
        return current.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: Math.min(50, entry.quantity + item.quantity) }
            : entry,
        );
      }
      return [...current, { ...item, key }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const safe = Math.max(1, Math.min(50, Math.trunc(quantity) || 1));
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, quantity: safe } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      totals,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, totals, hydrated, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
