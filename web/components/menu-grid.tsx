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
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{t.menu}</h1>
          <p className="mt-1 text-sm font-medium text-brgr-muted">{categories.length} categories</p>
        </div>

        {activeCategory ? (
          <button
            type="button"
            onClick={() => onCategorySelect(null)}
            className="h-10 rounded border border-white/15 bg-brgr-surface px-3 text-sm font-semibold text-brgr-text transition hover:border-brgr-gold/60"
          >
            Overview
          </button>
        ) : null}
      </div>

      <div className="menu-scrollbar sticky top-[73px] z-20 -mx-4 mb-5 flex gap-2 overflow-x-auto border-y border-white/10 bg-[rgba(24,24,27,0.92)] px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-[77px] lg:-mx-8 lg:px-8">
        {categories.map((category) => {
          const isActive = activeCategory === category.name_en;

          return (
            <button
              key={category.category_id}
              type="button"
              onClick={() => onCategorySelect(isActive ? null : category.name_en)}
              className={clsx(
                "h-10 shrink-0 rounded border px-4 text-sm font-bold transition",
                isActive
                  ? "border-brgr-gold bg-brgr-gold text-brgr-goldink"
                  : "border-white/15 bg-brgr-surface text-brgr-text hover:border-brgr-gold/60",
              )}
            >
              {getCategoryLabel(category, language)}
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const isMuted = Boolean(activeCategory && activeCategory !== category.name_en);
          const isActive = !activeCategory || activeCategory === category.name_en;

          return (
            <section
              key={category.category_id}
              ref={(node) => {
                sectionRefs.current[category.name_en] = node;
              }}
              className={clsx("scroll-mt-36 transition-opacity duration-300", isMuted && "opacity-35")}
              aria-hidden={!isActive}
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">
                    {getCategoryLabel(category, language)}
                  </h2>
                  <p className="text-sm font-medium text-brgr-muted">
                    {category.item_count} {category.item_count === 1 ? t.item : t.items}
                  </p>
                </div>

                {category.price_range_egp ? (
                  <span className="rounded border border-brgr-gold/40 bg-black/40 px-3 py-1 text-sm font-bold text-brgr-gold">
                    {formatPrice(category.price_range_egp[0])} - {formatPrice(category.price_range_egp[1])}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        "group flex min-h-card w-full flex-col justify-between rounded-lg border bg-brgr-surface p-4 text-start transition hover:-translate-y-0.5",
        highlighted ? "pulse-highlight border-brgr-gold" : "border-white/10 hover:border-brgr-gold/60",
        muted && "pointer-events-none",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-lg font-black leading-tight tracking-tight text-white">
          {normalizeDisplayName(item.name)}
        </h3>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brgr-muted transition group-hover:text-brgr-gold rtl:rotate-180" />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="rounded border border-brgr-gold/40 bg-black/40 px-3 py-1 text-sm font-black text-brgr-gold">
          {formatPrice(item.price_egp)}
        </span>

        {item.modifiers ? (
          <span className="text-xs font-bold uppercase tracking-wide text-brgr-muted">Options</span>
        ) : null}
      </div>
    </button>
  );
}
