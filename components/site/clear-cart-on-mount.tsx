"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

export function ClearCartOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
    try {
      sessionStorage.removeItem("laiba-bakes-custom-draft");
    } catch {
      // Ignore.
    }
    // The cart should only be cleared once when confirmation renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
