import {
  clearCart,
  computeTotal,
  getCart,
  serializeCartLine,
  setCart,
  type CartModifierLine,
  type CartModifiers,
} from "../../lib/cart-store";
import { getAddOnById, getMenuItemById } from "../../lib/menu";

export const config = { runtime: "edge" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function readToolPayload(req: Request): Promise<Record<string, unknown>> {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parameters =
    body.parameters && typeof body.parameters === "object" && !Array.isArray(body.parameters)
      ? (body.parameters as Record<string, unknown>)
      : body;

  return {
    ...parameters,
    conversation_id: parameters.conversation_id ?? body.conversation_id,
  };
}

function getAction(req: Request): string {
  const pathname = new URL(req.url).pathname;
  return pathname.split("/").filter(Boolean).at(-1) ?? "";
}

type ModifierResult = {
  modifiers?: CartModifiers;
  error?: string;
};

function normalizeModifiers(raw: unknown): ModifierResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const modifiers = raw as Record<string, unknown>;
  const normalized: CartModifiers = {};

  if (typeof modifiers.bun === "string" && modifiers.bun.trim()) {
    normalized.bun = modifiers.bun.trim();
  }

  if (Array.isArray(modifiers.add_ons)) {
    const addOns: CartModifierLine[] = [];

    for (const rawId of modifiers.add_ons) {
      const addOnId = Number(rawId);
      const item = getAddOnById(addOnId);

      if (!item) {
        return { error: `Add-on ${rawId} not found in menu` };
      }

      addOns.push({
        menu_item_id: item.id,
        name: item.name,
        unit_price: item.price_egp,
      });
    }

    normalized.add_ons = addOns;
  }

  if (Array.isArray(modifiers.addOns)) {
    const addOns: CartModifierLine[] = [];

    for (const rawId of modifiers.addOns) {
      const addOnId = Number(rawId);
      const item = getAddOnById(addOnId);

      if (!item) {
        return { error: `Add-on ${rawId} not found in menu` };
      }

      addOns.push({
        menu_item_id: item.id,
        name: item.name,
        unit_price: item.price_egp,
      });
    }

    normalized.add_ons = addOns;
  }

  return { modifiers: Object.keys(normalized).length ? normalized : undefined };
}

function modifierTotal(modifiers?: CartModifiers): number {
  return modifiers?.add_ons?.reduce((total, item) => total + item.unit_price, 0) ?? 0;
}

function getConversationId(payload: Record<string, unknown>): string {
  const value = payload.conversation_id ?? payload.conversationId;
  return typeof value === "string" ? value.trim() : "";
}

function handleAddToCart(payload: Record<string, unknown>): Response {
  const conversationId = getConversationId(payload);
  const menuItemId = Number(payload.menu_item_id ?? payload.menuItemId);
  const quantity = payload.quantity === undefined ? 1 : Number(payload.quantity);

  if (!conversationId) {
    return jsonResponse({ success: false, error: "conversation_id is required" }, 400);
  }

  if (!Number.isInteger(menuItemId)) {
    return jsonResponse({ success: false, error: "menu_item_id is required" }, 400);
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return jsonResponse({ success: false, error: "quantity must be a positive integer" }, 400);
  }

  const item = getMenuItemById(menuItemId);
  if (!item) {
    return jsonResponse({ success: false, error: "Item not found in menu" });
  }

  const modifierResult = normalizeModifiers(payload.modifiers);
  if (modifierResult.error) {
    return jsonResponse({ success: false, error: modifierResult.error });
  }

  const modifiers = modifierResult.modifiers;
  const unitPrice = item.price_egp + modifierTotal(modifiers);
  const cart = getCart(conversationId);
  const line = {
    line_id: crypto.randomUUID(),
    menu_item_id: item.id,
    name: item.name,
    quantity,
    unit_price: unitPrice,
    modifiers,
    notes: typeof payload.notes === "string" ? payload.notes.trim() : undefined,
  };

  cart.lines.push(line);
  setCart(cart);

  return jsonResponse({
    success: true,
    line_id: line.line_id,
    item_name: item.name,
    unit_price_egp: unitPrice,
    cart_total_egp: computeTotal(cart),
    line_count: cart.lines.length,
    line: serializeCartLine(line),
  });
}

function handleViewCart(payload: Record<string, unknown>): Response {
  const conversationId = getConversationId(payload);

  if (!conversationId) {
    return jsonResponse({ success: false, error: "conversation_id is required" }, 400);
  }

  const cart = getCart(conversationId);

  return jsonResponse({
    success: true,
    lines: cart.lines.map(serializeCartLine),
    total_egp: computeTotal(cart),
    line_count: cart.lines.length,
  });
}

function handleRemoveFromCart(payload: Record<string, unknown>): Response {
  const conversationId = getConversationId(payload);
  const rawLineId = payload.line_id ?? payload.lineId;
  const lineId = typeof rawLineId === "string" ? rawLineId.trim() : "";

  if (!conversationId) {
    return jsonResponse({ success: false, error: "conversation_id is required" }, 400);
  }

  if (!lineId) {
    return jsonResponse({ success: false, error: "line_id is required" }, 400);
  }

  const cart = getCart(conversationId);
  const lineIndex = cart.lines.findIndex((line) => line.line_id === lineId);

  if (lineIndex === -1) {
    return jsonResponse({ success: false, error: "Line not found in cart" });
  }

  const [removed] = cart.lines.splice(lineIndex, 1);
  setCart(cart);

  return jsonResponse({
    success: true,
    removed_item: removed.name,
    cart_total_egp: computeTotal(cart),
  });
}

function handleClearCart(payload: Record<string, unknown>): Response {
  const conversationId = getConversationId(payload);

  if (!conversationId) {
    return jsonResponse({ success: false, error: "conversation_id is required" }, 400);
  }

  clearCart(conversationId);

  return jsonResponse({
    success: true,
    lines: [],
    total_egp: 0,
    line_count: 0,
  });
}

function handleSubmitOrder(payload: Record<string, unknown>): Response {
  const conversationId = getConversationId(payload);
  const paymentMethod = typeof payload.payment_method === "string" ? payload.payment_method : "cash";

  if (!conversationId) {
    return jsonResponse({ success: false, error: "conversation_id is required" }, 400);
  }

  if (!["cash", "card", "online"].includes(paymentMethod)) {
    return jsonResponse({ success: false, error: "payment_method must be cash, card, or online" }, 400);
  }

  const cart = getCart(conversationId);
  if (cart.lines.length === 0) {
    return jsonResponse({ success: false, error: "Cart is empty" });
  }

  const total = computeTotal(cart);
  const orderNumber = `BRGR-${Math.floor(Math.random() * 90000 + 10000)}`;

  // TODO: Real BRGR ordering API integration goes here.
  console.log(
    JSON.stringify({
      order_number: orderNumber,
      conversation_id: conversationId,
      payment_method: paymentMethod,
      total_egp: total,
      lines: cart.lines.map(serializeCartLine),
    }),
  );

  clearCart(conversationId);

  return jsonResponse({
    success: true,
    order_number: orderNumber,
    estimated_minutes: 30,
    total_egp: total,
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const action = getAction(req);
  const payload = await readToolPayload(req);

  switch (action) {
    case "add-to-cart":
      return handleAddToCart(payload);
    case "view-cart":
      return handleViewCart(payload);
    case "remove-from-cart":
      return handleRemoveFromCart(payload);
    case "clear-cart":
      return handleClearCart(payload);
    case "submit-order":
      return handleSubmitOrder(payload);
    default:
      return jsonResponse({ success: false, error: "Unknown tool endpoint" }, 404);
  }
}
