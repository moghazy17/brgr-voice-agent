"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { copy } from "@/lib/i18n";
import { formatPrice, getCategoryLabel, normalizeDisplayName } from "@/lib/menu-data";
import type { Language, MenuCategory, MenuItem } from "@/lib/types";

type MenuGridProps = {
  categories: MenuCategory[];
  activeCategory: string | null;
  highlightedIds: number[];
  language: Language;
  onCategorySelect: (category: string | null) => void;
  onItemSelect: (itemId: number) => void;
};

export function MenuGrid({
  categories,
  activeCategory,
  highlightedIds,
  language,
  onCategorySelect,
  onItemSelect,
}: MenuGridProps) {
  const t = copy[language];
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const highlighted = useMemo(() => new Set(highlightedIds), [highlightedIds]);

  useEffect(() => {
    if (!activeCategory) {
      return;
    }

    sectionRefs.current[activeCategory]?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [activeCategory]);

  return (
    <section className="min-w-0" aria-label={t.menu}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brgr-muted">
            {language === "ar" ? "اختار من" : "Pick from"}
          </p>
          <h1 className="mt-1 font-display text-4xl leading-none tracking-tight text-brgr-ink sm:text-5xl">
            {t.menu}
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-brgr-muted">
            {categories.length} {language === "ar" ? "أقسام" : "categories"}
          </p>
        </div>

        {activeCategory ? (
          <button
            type="button"
            onClick={() => onCategorySelect(null)}
            className="btn-diner h-10 px-3 text-[11px] uppercase tracking-[0.18em]"
          >
            {language === "ar" ? "كل الأقسام" : "Show all"}
          </button>
        ) : null}
      </div>

      <div className="sticky top-[72px] z-20 -mx-4 mb-6 border-y-[3px] border-brgr-ink bg-brgr-cream/95 backdrop-blur sm:-mx-6 lg:-mx-8">
        <div className="menu-chip-fade relative">
          <div className="menu-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 md:flex-wrap md:overflow-visible lg:px-8">
            {categories.map((category) => {
              const isActive = activeCategory === category.name_en;

              return (
                <button
                  key={category.category_id}
                  type="button"
                  onClick={() => onCategorySelect(isActive ? null : category.name_en)}
                  aria-pressed={isActive}
                  className={clsx(
                    "btn-diner h-11 shrink-0 px-4 text-xs uppercase tracking-[0.14em]",
                    isActive && "is-active",
                  )}
                >
                  {getCategoryLabel(category, language)}
                  <span
                    aria-hidden
                    className="ms-2 inline-block rounded-full border-2 border-current px-1.5 text-[10px] font-black leading-tight opacity-70"
                  >
                    {category.item_count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {categories.map((category) => {
          const isMuted = Boolean(activeCategory && activeCategory !== category.name_en);
          const isActive = !activeCategory || activeCategory === category.name_en;

          return (
            <section
              key={category.category_id}
              ref={(node) => {
                sectionRefs.current[category.name_en] = node;
              }}
              className={clsx(
                "scroll-mt-44 transition-opacity duration-300 md:scroll-mt-52",
                isMuted && "opacity-35",
              )}
              aria-hidden={!isActive}
            >
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-brgr-ink/30 pb-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl tracking-tight text-brgr-ink">
                    {getCategoryLabel(category, language)}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brgr-muted">
                    {category.item_count} {category.item_count === 1 ? t.item : t.items}
                  </span>
                </div>

                {category.price_range_egp ? (
                  <span className="rounded-full border-2 border-brgr-ink bg-brgr-mustard px-3 py-1 text-xs font-black text-brgr-ink shadow-chip">
                    {formatPrice(category.price_range_egp[0])} — {formatPrice(category.price_range_egp[1])}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    highlighted={highlighted.has(item.id)}
                    muted={isMuted}
                    onSelect={() => onItemSelect(item.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ItemCard({
  item,
  highlighted,
  muted,
  onSelect,
}: {
  item: MenuItem;
  highlighted: boolean;
  muted: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "diner-card group flex min-h-card w-full flex-col justify-between p-4 text-start",
        highlighted && "is-hot",
        muted && "pointer-events-none is-muted",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-display text-xl leading-tight tracking-tight text-brgr-ink">
          {normalizeDisplayName(item.name)}
        </h3>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brgr-muted transition group-hover:text-brgr-red rtl:rotate-180" />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="rounded-full border-2 border-brgr-ink bg-brgr-mustard px-3 py-1 text-sm font-black text-brgr-ink shadow-chip">
          {formatPrice(item.price_egp)}
        </span>

        {item.modifiers ? (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brgr-muted">
            + Options
          </span>
        ) : null}
      </div>
    </button>
  );
}
