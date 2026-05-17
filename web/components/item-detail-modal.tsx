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
            className="fixed inset-0 z-[80] bg-brgr-ink/60 backdrop-blur-sm"
            aria-label={t.close}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.dialog
            open
            className="fixed left-1/2 top-1/2 z-[90] m-0 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border-[3px] border-brgr-ink bg-brgr-cream p-0 text-brgr-ink shadow-[10px_10px_0_0_#1A1410]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="relative flex items-start justify-between gap-4 border-b-2 border-dashed border-brgr-ink/30 bg-brgr-mustard p-5">
              <div className="halftone absolute inset-0 opacity-25" aria-hidden />
              <div className="relative min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-ink/70">
                  {category ? getCategoryLabel(category, language) : t.details}
                </p>
                <h2 className="mt-1 font-display text-3xl leading-tight tracking-tight text-brgr-ink">
                  {normalizeDisplayName(item.name)}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-brgr-ink bg-brgr-cream text-brgr-ink transition hover:bg-brgr-red hover:text-brgr-cream"
                title={t.close}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-4 rounded-[14px] border-2 border-brgr-ink bg-brgr-paper p-4 shadow-chip">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-muted">{t.total}</span>
                <span className="font-display text-3xl text-brgr-red">{formatPrice(item.price_egp)}</span>
              </div>

              {item.modifiers ? (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-muted">
                    {t.modifiers}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(item.modifiers).flatMap(([group, values]) =>
                      values.map((value) => (
                        <span
                          key={`${group}-${value}`}
                          className="rounded-full border-2 border-brgr-ink bg-brgr-cream px-3 py-1 text-sm font-bold text-brgr-ink shadow-chip"
                        >
                          {value}
                        </span>
                      )),
                    )}
                  </div>
                </div>
              ) : null}

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brgr-muted">
                {language === "ar" ? "كلم BRGR لتطلب" : "Tap the orb and tell BRGR you want this"}
              </p>
            </div>
          </motion.dialog>
        </>
      ) : null}
    </AnimatePresence>
  );
}
