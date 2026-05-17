"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { copy } from "@/lib/i18n";
import { findCategoryForItem, findMenuItem, formatPrice, getCategoryLabel, normalizeDisplayName } from "@/lib/menu-data";
import type { Language } from "@/lib/types";

type ItemDetailModalProps = {
  itemId: number | null;
  language: Language;
  onClose: () => void;
};

export function ItemDetailModal({ itemId, language, onClose }: ItemDetailModalProps) {
  const item = findMenuItem(itemId);
  const category = findCategoryForItem(itemId);
  const t = copy[language];

  return (
    <AnimatePresence>
      {item ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-label={t.close}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.dialog
            open
            className="fixed left-1/2 top-1/2 z-50 m-0 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/12 bg-brgr-surface p-0 text-brgr-text shadow-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-brgr-gold">
                  {category ? getCategoryLabel(category, language) : t.details}
                </p>
                <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight text-white">
                  {normalizeDisplayName(item.name)}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded border border-white/15 text-brgr-muted transition hover:border-brgr-gold/60 hover:text-brgr-gold"
                title={t.close}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-brgr-gold/30 bg-black/40 p-4">
                <span className="text-sm font-bold text-brgr-muted">{t.total}</span>
                <span className="text-2xl font-black text-brgr-gold">{formatPrice(item.price_egp)}</span>
              </div>

              {item.modifiers ? (
                <div>
                  <h3 className="text-sm font-black text-white">{t.modifiers}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(item.modifiers).flatMap(([group, values]) =>
                      values.map((value) => (
                        <span
                          key={`${group}-${value}`}
                          className="rounded border border-white/15 bg-black/30 px-3 py-1 text-sm font-semibold text-brgr-text"
                        >
                          {value}
                        </span>
                      )),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.dialog>
        </>
      ) : null}
    </AnimatePresence>
  );
}
