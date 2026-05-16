import menuData from "../../brgr-menu.json";

export type MenuItem = {
  id: number;
  name: string;
  price_egp: number;
  modifiers?: unknown;
};

export type MenuCategory = {
  category_id: number;
  name_en: string;
  name_ar?: string;
  item_count: number;
  price_range_egp?: number[];
  items: MenuItem[];
};

export type AddOnItem = {
  id: number;
  name: string;
  price_egp: number;
};

type MenuData = {
  categories: MenuCategory[];
  extras_addons: AddOnItem[];
  sauces?: AddOnItem[];
};

const menu = menuData as unknown as MenuData;

const itemLookup = new Map<number, MenuItem>();
const addOnLookup = new Map<number, AddOnItem>();

for (const category of menu.categories) {
  for (const item of category.items) {
    itemLookup.set(item.id, item);
  }
}

for (const item of menu.extras_addons) {
  if (!item.name.toLowerCase().startsWith("free ")) {
    addOnLookup.set(item.id, item);
  }
}

export function getMenuItemById(id: number): MenuItem | undefined {
  return itemLookup.get(Number(id));
}

export function getAddOnById(id: number): AddOnItem | undefined {
  return addOnLookup.get(Number(id));
}

export function getCategories(): MenuCategory[] {
  return menu.categories;
}
