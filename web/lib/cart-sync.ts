"use client";

import { viewCart } from "./cart-api";
import { useBrgrStore } from "./store";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCartSync(delayMs = 600, requestedConversationId?: string | null): void {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(async () => {
    const { conversationId, setCart, setCartSyncError } = useBrgrStore.getState();
    const syncConversationId = requestedConversationId || conversationId;

    if (process.env.NODE_ENV !== "production") {
      console.log("[brgr][scheduleCartSync] firing", { conversationId: syncConversationId });
    }

    if (!syncConversationId) {
      return;
    }

    try {
      const cart = await viewCart(syncConversationId);
      if (process.env.NODE_ENV !== "production") {
        console.log("[brgr][scheduleCartSync] viewCart result", cart);
      }

      const currentCart = useBrgrStore.getState().cart;
      const pendingLines = currentCart.lines.filter((line) => line.line_id.startsWith("pending-"));

      if (cart.lines.length === 0 && pendingLines.length > 0) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[brgr][scheduleCartSync] preserving pending cart lines", pendingLines);
        }
        return;
      }

      setCart(cart);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[brgr][scheduleCartSync] viewCart error", error);
      }
      setCartSyncError(error instanceof Error ? error.message : "Could not sync cart");
    }
  }, delayMs);
}
