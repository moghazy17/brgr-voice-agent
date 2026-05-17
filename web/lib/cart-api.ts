import type { CartState } from "./types";

const FALLBACK_BACKEND_URL = "https://brgr-tools.vercel.app";

export const backendUrl = (process.env.NEXT_PUBLIC_BRGR_BACKEND_URL ?? FALLBACK_BACKEND_URL).replace(/\/$/, "");

async function postTool<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${backendUrl}/api/tools/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as T & { success?: boolean; error?: string };

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Request failed for ${action}`);
  }

  return payload;
}

export async function viewCart(conversationId: string): Promise<CartState> {
  return postTool<CartState>("view-cart", { conversation_id: conversationId });
}

export async function removeLine(conversationId: string, lineId: string): Promise<{ cart_total_egp: number }> {
  return postTool<{ cart_total_egp: number }>("remove-from-cart", {
    conversation_id: conversationId,
    line_id: lineId,
  });
}
