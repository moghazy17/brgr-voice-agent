"use client";

import { scheduleCartSync } from "./cart-sync";
import { useBrgrStore } from "./store";
import type { CartLine, CartState } from "./types";

const TOOL_NAMES = new Set(["add_to_cart", "view_cart", "remove_from_cart", "submit_order"]);

type ToolEvent = {
  name: string;
  parameters?: unknown;
  response?: unknown;
  raw: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function unwrapResult(value: unknown): unknown {
  const parsed = parseMaybeJson(value);

  if (isRecord(parsed) && "result" in parsed) {
    return parseMaybeJson(parsed.result);
  }

  return parsed;
}

export function extractConversationId(value: unknown): string | null {
  const seen = new Set<unknown>();
  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.pop();

    if (!isRecord(current) || seen.has(current)) {
      continue;
    }

    seen.add(current);

    const id = current.conversation_id ?? current.conversationId;
    if (typeof id === "string" && id.trim()) {
      return id.trim();
    }

    for (const child of Object.values(current)) {
      if (typeof child === "object" && child !== null) {
        stack.push(child);
      }
    }
  }

  return null;
}

function extractText(value: unknown): { role: "agent" | "user" | "tool"; text: string } | null {
  if (!isRecord(value)) {
    return null;
  }

  const textValue = value.message ?? value.text ?? value.transcript ?? value.content;
  const text = typeof textValue === "string" ? textValue.trim() : "";

  if (!text) {
    return null;
  }

  const source = String(value.source ?? value.role ?? value.type ?? "").toLowerCase();
  const role = source.includes("user") ? "user" : source.includes("tool") ? "tool" : "agent";

  return { role, text };
}

function normalizeToolName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return TOOL_NAMES.has(value) ? value : null;
}

function extractToolEvents(value: unknown): ToolEvent[] {
  const events: ToolEvent[] = [];
  const seen = new Set<unknown>();
  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.pop();

    if (!isRecord(current) || seen.has(current)) {
      continue;
    }

    seen.add(current);

    const name =
      normalizeToolName(current.tool_name) ??
      normalizeToolName(current.toolName) ??
      normalizeToolName(current.name) ??
      normalizeToolName(current.function_name) ??
      normalizeToolName(isRecord(current.function) ? current.function.name : undefined);

    if (name) {
      events.push({
        name,
        parameters:
          current.parameters ??
          current.args ??
          current.arguments ??
          current.input ??
          (isRecord(current.function) ? current.function.arguments : undefined),
        response: current.response ?? current.result ?? current.output ?? current.tool_response ?? current.full_tool_result,
        raw: current,
      });
    }

    for (const child of Object.values(current)) {
      if (typeof child === "object" && child !== null) {
        stack.push(child);
      }
    }
  }

  return events;
}

function isCartLine(value: unknown): value is CartLine {
  return (
    isRecord(value) &&
    typeof value.line_id === "string" &&
    Number.isFinite(Number(value.menu_item_id)) &&
    typeof value.name === "string" &&
    Number.isFinite(Number(value.quantity)) &&
    Number.isFinite(Number(value.unit_price))
  );
}

function normalizeCart(value: unknown): CartState | null {
  const payload = unwrapResult(value);

  if (!isRecord(payload) || !Array.isArray(payload.lines)) {
    return null;
  }

  const lines = payload.lines.filter(isCartLine);
  const total = Number(payload.total_egp ?? payload.cart_total_egp ?? 0);

  return {
    lines,
    total_egp: Number.isFinite(total) ? total : 0,
    line_count: Number(payload.line_count ?? lines.length),
  };
}

function mirrorToolEvent(event: ToolEvent): void {
  const store = useBrgrStore.getState();
  const response = unwrapResult(event.response ?? event.raw);
  const parameters = parseMaybeJson(event.parameters);

  if (event.name === "view_cart") {
    const cart = normalizeCart(response);
    if (cart) {
      store.setCart(cart);
      return;
    }
  }

  if (event.name === "add_to_cart" && isRecord(response) && isCartLine(response.line)) {
    const total = Number(response.cart_total_egp);
    store.upsertCartLine(response.line, Number.isFinite(total) ? total : undefined);
    scheduleCartSync();
    return;
  }

  if (event.name === "remove_from_cart") {
    const lineId = isRecord(parameters) && typeof parameters.line_id === "string" ? parameters.line_id : null;
    const total = isRecord(response) ? Number(response.cart_total_egp) : undefined;

    if (lineId) {
      store.removeCartLine(lineId, Number.isFinite(total) ? total : undefined);
    }

    scheduleCartSync();
    return;
  }

  if (event.name === "submit_order" && isRecord(response) && response.success === true) {
    store.clearCart();
    return;
  }

  scheduleCartSync();
}

export function handleConversationMessage(message: unknown): void {
  const store = useBrgrStore.getState();
  const conversationId = extractConversationId(message);

  if (conversationId) {
    store.setConversationId(conversationId);
  }

  const transcript = extractText(message);
  if (transcript) {
    store.addTranscript(transcript);
  }

  const toolEvents = extractToolEvents(message);
  for (const event of toolEvents) {
    mirrorToolEvent(event);
  }

  if (toolEvents.length > 0) {
    scheduleCartSync(900);
  }
}
