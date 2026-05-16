import {
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

  return { modifiers: Object.keys(normalized).length ? normalized : undefined };
}

function modifierTotal(modifiers?: CartModifiers): number {
  return modifiers?.add_ons?.reduce((total, item) => total + item.unit_price, 0) ?? 0;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const payload = await readToolPayload(req);
  const conversationId = typeof payload.conversation_id === "string" ? payload.conversation_id.trim() : "";
  const menuItemId = Number(payload.menu_item_id);
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
