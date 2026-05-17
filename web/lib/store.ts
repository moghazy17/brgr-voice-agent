import { create } from "zustand";
import type { AgentStatus, CartLine, CartState, Language, TranscriptMessage } from "./types";

type BrgrStore = {
  activeCategory: string | null;
  highlightedIds: number[];
  detailItemId: number | null;
  language: Language;
  cart: CartState;
  agentStatus: AgentStatus;
  transcript: TranscriptMessage[];
  conversationId: string | null;
  cartSyncError: string | null;
  agentError: string | null;
  setActiveCategory: (category: string | null) => void;
  setHighlightedIds: (ids: number[]) => void;
  setDetailItemId: (itemId: number | null) => void;
  setLanguage: (language: Language) => void;
  setCart: (cart: CartState) => void;
  upsertCartLine: (line: CartLine, total?: number) => void;
  removeCartLine: (lineId: string, total?: number) => void;
  clearCart: () => void;
  setAgentStatus: (status: AgentStatus) => void;
  addTranscript: (message: Omit<TranscriptMessage, "id" | "timestamp"> & Partial<Pick<TranscriptMessage, "timestamp">>) => void;
  setConversationId: (conversationId: string | null) => void;
  setCartSyncError: (error: string | null) => void;
  setAgentError: (error: string | null) => void;
};

const emptyCart: CartState = {
  lines: [],
  total_egp: 0,
  line_count: 0,
};

function makeMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function computeTotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.unit_price * line.quantity, 0);
}

export const useBrgrStore = create<BrgrStore>((set) => ({
  activeCategory: null,
  highlightedIds: [],
  detailItemId: null,
  language: "en",
  cart: emptyCart,
  agentStatus: "idle",
  transcript: [],
  conversationId: null,
  cartSyncError: null,
  agentError: null,
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setHighlightedIds: (highlightedIds) => set({ highlightedIds }),
  setDetailItemId: (detailItemId) => set({ detailItemId }),
  setLanguage: (language) => set({ language }),
  setCart: (cart) =>
    set({
      cart: {
        lines: cart.lines,
        total_egp: cart.total_egp,
        line_count: cart.line_count ?? cart.lines.length,
      },
      cartSyncError: null,
    }),
  upsertCartLine: (line, total) =>
    set((state) => {
      const lines = state.cart.lines.some((existing) => existing.line_id === line.line_id)
        ? state.cart.lines.map((existing) => (existing.line_id === line.line_id ? line : existing))
        : [...state.cart.lines, line];

      return {
        cart: {
          lines,
          total_egp: total ?? computeTotal(lines),
          line_count: lines.length,
        },
        cartSyncError: null,
      };
    }),
  removeCartLine: (lineId, total) =>
    set((state) => {
      const lines = state.cart.lines.filter((line) => line.line_id !== lineId);

      return {
        cart: {
          lines,
          total_egp: total ?? computeTotal(lines),
          line_count: lines.length,
        },
      };
    }),
  clearCart: () => set({ cart: emptyCart }),
  setAgentStatus: (agentStatus) => set({ agentStatus }),
  addTranscript: (message) =>
    set((state) => ({
      transcript: [
        ...state.transcript.slice(-19),
        {
          id: makeMessageId(),
          timestamp: message.timestamp ?? Date.now(),
          role: message.role,
          text: message.text,
        },
      ],
    })),
  setConversationId: (conversationId) => set({ conversationId }),
  setCartSyncError: (cartSyncError) => set({ cartSyncError }),
  setAgentError: (agentError) => set({ agentError }),
}));
