export type CartModifierLine = {
  menu_item_id: number;
  name: string;
  unit_price: number;
};

export type CartModifiers = {
  bun?: string;
  add_ons?: CartModifierLine[];
};

export type CartLine = {
  line_id: string;
  menu_item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  modifiers?: CartModifiers;
  notes?: string;
};

export type Cart = {
  conversation_id: string;
  lines: CartLine[];
  created_at: number;
  updated_at: number;
};

const CART_TTL_MS = 30 * 60 * 1000;
const carts = new Map<string, Cart>();

function now(): number {
  return Date.now();
}

function pruneExpiredCarts(): void {
  const cutoff = now() - CART_TTL_MS;

  for (const [conversationId, cart] of carts.entries()) {
    if (cart.updated_at < cutoff) {
      carts.delete(conversationId);
    }
  }
}

export function getCart(conversationId: string): Cart {
  pruneExpiredCarts();

  const existing = carts.get(conversationId);
  if (existing) {
    return existing;
  }

  const timestamp = now();
  const cart: Cart = {
    conversation_id: conversationId,
    lines: [],
    created_at: timestamp,
    updated_at: timestamp,
  };

  carts.set(conversationId, cart);
  return cart;
}

export function setCart(cart: Cart): void {
  cart.updated_at = now();
  carts.set(cart.conversation_id, cart);
}

export function clearCart(conversationId: string): void {
  carts.delete(conversationId);
}

export function computeTotal(cart: Cart): number {
  return cart.lines.reduce((total, line) => total + line.unit_price * line.quantity, 0);
}

export function serializeCartLine(line: CartLine) {
  return {
    ...line,
    line_total_egp: line.unit_price * line.quantity,
  };
}
