import { computeTotal, getCart, setCart } from "../../lib/cart-store";

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const payload = await readToolPayload(req);
  const conversationId = typeof payload.conversation_id === "string" ? payload.conversation_id.trim() : "";
  const lineId = typeof payload.line_id === "string" ? payload.line_id.trim() : "";

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
