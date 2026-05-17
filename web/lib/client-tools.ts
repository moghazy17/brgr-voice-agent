"use client";

import { useConversationClientTool } from "@elevenlabs/react";
import { useBrgrStore } from "./store";
import type { Language } from "./types";

let highlightTimer: ReturnType<typeof setTimeout> | null = null;

type ToolArgs = Record<string, unknown>;

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(Number).filter((id) => Number.isFinite(id));
}

function asLanguage(value: unknown): Language {
  return value === "ar" ? "ar" : "en";
}

export function useRegisterClientTools(): void {
  useConversationClientTool("show_category", async (args: ToolArgs) => {
    const categoryName = typeof args.category_name === "string" ? args.category_name : null;
    useBrgrStore.getState().setActiveCategory(categoryName);

    return categoryName ? `Showing ${categoryName}` : "Category not found";
  });

  useConversationClientTool("highlight_items", async (args: ToolArgs) => {
    const itemIds = asNumberArray(args.item_ids);
    const store = useBrgrStore.getState();

    store.setHighlightedIds(itemIds);

    if (highlightTimer) {
      clearTimeout(highlightTimer);
    }

    highlightTimer = setTimeout(() => {
      useBrgrStore.getState().setHighlightedIds([]);
    }, 6000);

    return `Highlighted ${itemIds.length} items`;
  });

  useConversationClientTool("show_item_detail", async (args: ToolArgs) => {
    const itemId = Number(args.item_id);
    useBrgrStore.getState().setDetailItemId(Number.isFinite(itemId) ? itemId : null);

    return Number.isFinite(itemId) ? `Showing detail for item ${itemId}` : "Item not found";
  });

  useConversationClientTool("clear_focus", async () => {
    const store = useBrgrStore.getState();
    store.setActiveCategory(null);
    store.setHighlightedIds([]);
    store.setDetailItemId(null);

    return "Cleared";
  });

  useConversationClientTool("set_language", async (args: ToolArgs) => {
    const language = asLanguage(args.language);
    useBrgrStore.getState().setLanguage(language);

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    return `UI switched to ${language}`;
  });

}
