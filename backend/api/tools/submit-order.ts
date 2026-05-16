import { clearCart, computeTotal, getCart, serializeCartLine } from "../../lib/cart-store";

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

function isEgyptianPhone(phone: string): boolean {
  return /^01[0125]\d{8}$/.test(phone);
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
  const customerName = typeof payload.customer_name === "string" ? payload.customer_name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const address = typeof payload.address === "string" ? payload.address.trim() : "";
  const paymentMethod = typeof payload.payment_method === "string" ? payload.payment_method : "cash";

  if (!conversationId) {
    return jsonResponse({ success: false, error: "conversation_id is required" }, 400);
  }

  if (!customerName || !phone || !address) {
    return jsonResponse({ success: false, error: "customer_name, phone, and address are required" }, 400);
  }

  if (!isEgyptianPhone(phone)) {
    return jsonResponse({ success: false, error: "Phone must be 11 digits starting with 010, 011, 012, or 015" });
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
      customer_name: customerName,
      phone,
      address,
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
