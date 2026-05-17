"use client";

import { viewCart } from "./cart-api";
import { useBrgrStore } from "./store";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCartSync(delayMs = 600): void {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(async () => {
    const { conversationId, setCart, setCartSyncError } = useBrgrStore.getState();

    if (!conversationId) {
      return;
    }

    try {
      const cart = await viewCart(conversationId);
      setCart(cart);
    } catch (error) {
      setCartSyncError(error instanceof Error ? error.message : "Could not sync cart");
    }
  }, delayMs);
}
