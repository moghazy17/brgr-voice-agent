export type Language = "en" | "ar";

export type AgentStatus = "idle" | "connecting" | "listening" | "speaking" | "processing";

export type MenuItem = {
  id: number;
  name: string;
  price_egp: number;
  modifiers?: Record<string, string[]>;
};

export type MenuCategory = {
  category_id: number;
  name_en: string;
  name_ar?: string;
  item_count: number;
  price_range_egp?: number[];
  items: MenuItem[];
};

export type MenuData = {
  metadata: {
    restaurant: string;
    location: string;
    currency: string;
  };
  categories: MenuCategory[];
  extras_addons: MenuItem[];
  sauces?: MenuItem[];
  allergens_vocabulary?: string[];
};

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
  line_total_egp?: number;
};

export type CartState = {
  lines: CartLine[];
  total_egp: number;
  line_count: number;
};

export type TranscriptMessage = {
  id: string;
  role: "agent" | "user" | "tool" | "system";
  text: string;
  timestamp: number;
};
