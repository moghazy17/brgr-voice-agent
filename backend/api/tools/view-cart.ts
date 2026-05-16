import { computeTotal, getCart, serializeCartLine } from "../../lib/cart-store";

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
