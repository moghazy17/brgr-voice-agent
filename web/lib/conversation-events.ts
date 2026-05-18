"use client";

import { scheduleCartSync } from "./cart-sync";
import { extrasAddons, findMenuItem, menuItems, normalizeDisplayName } from "./menu-data";
import { useBrgrStore } from "./store";
import type { CartLine, CartModifiers, CartState } from "./types";

const TOOL_NAMES = new Set(["add_to_cart", "view_cart", "remove_from_cart", "submit_order"]);

type ToolEvent = {
  name: string;
  parameters?: unknown;
  response?: unknown;
  raw: unknown;
};

type TranscriptEvent = {
  role: "agent" | "user" | "tool";
  text: string;
  id?: string;
};

const recentOptimisticAdds = new Map<string, number>();
const OPTIMISTIC_DEDUPE_MS = 1000;
const recentTranscriptEvents = new Map<string, number>();
const TRANSCRIPT_DEDUPE_MS = 1500;

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

function extractText(value: unknown): TranscriptEvent | null {
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

function extractTranscriptEvents(value: unknown): TranscriptEvent[] {
  const events: TranscriptEvent[] = [];
  const seen = new Set<unknown>();
  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.pop();

    if (!isRecord(current) || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (isRecord(current.user_transcription_event)) {
      const text = current.user_transcription_event.user_transcript;
      if (typeof text === "string" && text.trim()) {
        events.push({ role: "user", text: text.trim(), id: getEventId(current) ?? undefined });
      }
    }

    if (isRecord(current.agent_response_event)) {
      const text = current.agent_response_event.agent_response;
      if (typeof text === "string" && text.trim()) {
        events.push({ role: "agent", text: text.trim(), id: getEventId(current) ?? undefined });
      }
    }

    const directText = extractText(current);
    if (directText) {
      events.push({ ...directText, id: getEventId(current) ?? undefined });
    }

    for (const child of Object.values(current)) {
      if (typeof child === "object" && child !== null) {
        stack.push(child);
      }
    }
  }

  return events;
}

function shouldAddTranscript(event: TranscriptEvent): boolean {
  const now = Date.now();
  recentTranscriptEvents.forEach((timestamp, key) => {
    if (now - timestamp > TRANSCRIPT_DEDUPE_MS) {
      recentTranscriptEvents.delete(key);
    }
  });

  const key = event.id ?? `${event.role}:${event.text}`;
  const previous = recentTranscriptEvents.get(key);
  if (previous && now - previous <= TRANSCRIPT_DEDUPE_MS) {
    return false;
  }

  recentTranscriptEvents.set(key, now);
  return true;
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
    line_count: Number.isFinite(Number(payload.line_count)) ? Number(payload.line_count) : lines.length,
  };
}

function makePendingLineId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getEventId(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.tool_call_id ?? value.toolCallId ?? value.call_id ?? value.callId ?? value.id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

function cleanupRecentOptimisticAdds(now: number): void {
  recentOptimisticAdds.forEach((timestamp, key) => {
    if (now - timestamp > OPTIMISTIC_DEDUPE_MS) {
      recentOptimisticAdds.delete(key);
    }
  });
}

function shouldMirrorOptimisticAdd(event: ToolEvent, parameters: unknown): boolean {
  const now = Date.now();
  cleanupRecentOptimisticAdds(now);

  const eventKey = getEventId(event.raw);
  const parametersKey = JSON.stringify(parameters);
  const previous = [eventKey, parametersKey]
    .filter((key): key is string => Boolean(key))
    .some((key) => {
      const timestamp = recentOptimisticAdds.get(key);
      return Boolean(timestamp && now - timestamp <= OPTIMISTIC_DEDUPE_MS);
    });

  if (previous) {
    return false;
  }

  if (eventKey) {
    recentOptimisticAdds.set(eventKey, now);
  }
  recentOptimisticAdds.set(parametersKey, now);

  return true;
}

function normalizeRequestedModifiers(raw: unknown): CartModifiers | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  const modifiers: CartModifiers = {};

  if (typeof raw.bun === "string" && raw.bun.trim()) {
    modifiers.bun = raw.bun.trim();
  }

  if (Array.isArray(raw.add_ons)) {
    const addOns = raw.add_ons
      .map((rawId) => Number(rawId))
      .filter((id) => Number.isFinite(id))
      .map((id) => extrasAddons.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        menu_item_id: item.id,
        name: item.name,
        unit_price: item.price_egp,
      }));

    if (addOns.length) {
      modifiers.add_ons = addOns;
    }
  }

  return Object.keys(modifiers).length ? modifiers : undefined;
}

function modifierTotal(modifiers?: CartModifiers): number {
  return modifiers?.add_ons?.reduce((total, item) => total + item.unit_price, 0) ?? 0;
}

function normalizeNotes(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stableModifiers(value?: CartModifiers): string {
  return JSON.stringify({
    bun: value?.bun ?? "",
    add_ons: (value?.add_ons ?? []).map((item) => item.menu_item_id).sort((a, b) => a - b),
  });
}

function isSameCartRequest(left: CartLine, right: CartLine): boolean {
  return (
    left.menu_item_id === right.menu_item_id &&
    left.quantity === right.quantity &&
    left.unit_price === right.unit_price &&
    (left.notes ?? "") === (right.notes ?? "") &&
    stableModifiers(left.modifiers) === stableModifiers(right.modifiers)
  );
}

function replaceOptimisticLine(line: CartLine, total?: number): boolean {
  const store = useBrgrStore.getState();
  const lineIndex = store.cart.lines.findIndex(
    (existing) => existing.line_id.startsWith("pending-") && isSameCartRequest(existing, line),
  );

  if (lineIndex === -1) {
    return false;
  }

  const lines = store.cart.lines.map((existing, index) => (index === lineIndex ? line : existing));
  const fallbackTotal = lines.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  store.setCart({
    lines,
    total_egp: total ?? fallbackTotal,
    line_count: lines.length,
  });

  return true;
}

function mirrorOptimisticAdd(event: ToolEvent, parameters: unknown): boolean {
  if (!isRecord(parameters) || !shouldMirrorOptimisticAdd(event, parameters)) {
    return false;
  }

  const menuItemId = Number(parameters.menu_item_id);
  const quantity = Number(parameters.quantity ?? 1);
  const item = findMenuItem(menuItemId);

  if (!item || !Number.isInteger(quantity) || quantity < 1) {
    return false;
  }

  const modifiers = normalizeRequestedModifiers(parameters.modifiers);
  const line: CartLine = {
    line_id: makePendingLineId(),
    menu_item_id: item.id,
    name: item.name,
    quantity,
    unit_price: item.price_egp + modifierTotal(modifiers),
    modifiers,
    notes: normalizeNotes(parameters.notes),
  };

  useBrgrStore.getState().upsertCartLine(line);
  return true;
}

function normalizeForMatch(value: string): string {
  return normalizeDisplayName(value).toLowerCase();
}

function looksLikeAddConfirmation(text: string): boolean {
  const normalized = normalizeForMatch(text);
  return (
    /\b(?:added|add(?:ed)? it|i(?:'|’)ve added)\b/.test(normalized) ||
    (normalized.includes("تمام") && normalized.includes("جنيه"))
  );
}

function parseConfirmedQuantity(text: string, unitPrice: number): number {
  const normalized = normalizeForMatch(text);
  const numericMatch = normalized.match(/\b(?:added\s+)?(\d+)\s+x?\s+[a-z]/);
  const totalMatch = normalized.match(/\b(\d+)\s*egp\b/);

  if (numericMatch) {
    const quantity = Number(numericMatch[1]);
    if (Number.isInteger(quantity) && quantity > 0) {
      return quantity;
    }
  }

  if (totalMatch) {
    const total = Number(totalMatch[1]);
    const quantity = total / unitPrice;
    if (Number.isInteger(quantity) && quantity > 0) {
      return quantity;
    }
  }

  return 1;
}

function mirrorTranscriptAdd(text: string): void {
  if (!looksLikeAddConfirmation(text)) {
    return;
  }

  const normalizedText = normalizeForMatch(text);
  const item = [...menuItems]
    .sort((left, right) => right.name.length - left.name.length)
    .find((candidate) => normalizedText.includes(normalizeForMatch(candidate.name)));

  if (!item) {
    return;
  }

  const quantity = parseConfirmedQuantity(text, item.price_egp);
  const line: CartLine = {
    line_id: makePendingLineId(),
    menu_item_id: item.id,
    name: item.name,
    quantity,
    unit_price: item.price_egp,
  };

  const event: ToolEvent = {
    name: "add_to_cart",
    parameters: { menu_item_id: item.id, quantity },
    raw: { id: `transcript:${normalizeForMatch(text)}` },
  };

  if (!shouldMirrorOptimisticAdd(event, event.parameters)) {
    return;
  }

  useBrgrStore.getState().upsertCartLine(line);
  scheduleCartSync();
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
    const safeTotal = Number.isFinite(total) ? total : undefined;

    if (!replaceOptimisticLine(response.line, safeTotal)) {
      store.upsertCartLine(response.line, safeTotal);
    }

    scheduleCartSync();
    return;
  }

  if (event.name === "add_to_cart" && mirrorOptimisticAdd(event, parameters)) {
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

  const transcriptEvents = extractTranscriptEvents(message);
  for (const transcript of transcriptEvents) {
    if (!shouldAddTranscript(transcript)) {
      continue;
    }

    store.addTranscript(transcript);
    if (transcript.role === "agent") {
      mirrorTranscriptAdd(transcript.text);
    }
  }

  const toolEvents = extractToolEvents(message);
  for (const event of toolEvents) {
    mirrorToolEvent(event);
  }

  if (toolEvents.length > 0) {
    scheduleCartSync(900);
  }
}
