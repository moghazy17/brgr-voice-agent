import rawMenuData from "./brgr-menu.json";
import type { Language, MenuCategory, MenuData, MenuItem } from "./types";

export const menuData = rawMenuData as MenuData;

export const categories = menuData.categories;

export const extrasAddons = menuData.extras_addons.filter((item) => !item.name.toLowerCase().startsWith("free "));

export const menuItems = categories.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    category: category.name_en,
  })),
);

const itemLookup = new Map<number, MenuItem>();
const categoryLookup = new Map<number, MenuCategory>();

for (const category of categories) {
  for (const item of category.items) {
    itemLookup.set(item.id, item);
    categoryLookup.set(item.id, category);
  }
}

export function findMenuItem(itemId: number | null | undefined): MenuItem | undefined {
  if (!itemId) {
    return undefined;
  }

  return itemLookup.get(Number(itemId));
}

export function findCategoryForItem(itemId: number | null | undefined): MenuCategory | undefined {
  if (!itemId) {
    return undefined;
  }

  return categoryLookup.get(Number(itemId));
}

export function getCategoryLabel(category: MenuCategory, language: Language): string {
  return language === "ar" && category.name_ar ? category.name_ar : category.name_en;
}

export function normalizeDisplayName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("en-US")} EGP`;
}
