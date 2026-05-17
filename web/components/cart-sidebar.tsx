"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { copy } from "@/lib/i18n";
import { formatPrice } from "@/lib/menu-data";
import type { CartLine, CartState, Language } from "@/lib/types";

type CartSidebarProps = {
  cart: CartState;
  language: Language;
  onRemoveLine: (lineId: string) => void;
};

export function CartSidebar({ cart, language, onRemoveLine }: CartSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = copy[language];

  return (
    <>
      <section className="hidden h-full flex-col rounded-lg border border-white/10 bg-brgr-surface md:flex" aria-label={t.order}>
        <CartContent cart={cart} language={language} onRemoveLine={onRemoveLine} />
      </section>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-between border-t border-white/10 bg-brgr-surface px-4 shadow-panel"
        >
          <span className="flex items-center gap-3 text-start">
            <ShoppingBag className="h-5 w-5 text-brgr-gold" aria-hidden />
            <span>
              <span className="block text-sm font-black text-white">{t.order}</span>
              <span className="block text-xs font-semibold text-brgr-muted">
                {cart.line_count} {cart.line_count === 1 ? t.item : t.items}
              </span>
            </span>
          </span>
          <span className="text-lg font-black text-brgr-gold">{formatPrice(cart.total_egp)}</span>
        </button>

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                aria-label={t.close}
                className="fixed inset-0 z-40 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.section
                className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-hidden rounded-t-lg border-t border-white/10 bg-brgr-surface shadow-panel"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                aria-label={t.order}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <h2 className="text-lg font-black text-white">{t.order}</h2>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded border border-white/15 text-brgr-text"
                    title={t.close}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <CartContent cart={cart} language={language} onRemoveLine={onRemoveLine} mobile />
              </motion.section>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

function CartContent({
  cart,
  language,
  onRemoveLine,
  mobile = false,
}: CartSidebarProps & {
  mobile?: boolean;
}) {
  const t = copy[language];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!mobile ? (
        <div className="border-b border-white/10 p-4">
          <h2 className="text-xl font-black tracking-tight text-white">{t.order}</h2>
          <p className="mt-1 text-sm font-medium text-brgr-muted">
            {cart.line_count} {cart.line_count === 1 ? t.item : t.items}
          </p>
        </div>
      ) : null}

      <div className="menu-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {cart.lines.length ? (
            <div className="space-y-3">
              {cart.lines.map((line) => (
                <CartLineRow key={line.line_id} line={line} language={language} onRemoveLine={onRemoveLine} />
              ))}
            </div>
          ) : (
            <motion.div
              key="empty"
              className="grid min-h-40 place-items-center rounded-lg border border-dashed border-white/15 text-sm font-semibold text-brgr-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {t.emptyCart}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-brgr-muted">{t.total}</span>
          <span className="text-2xl font-black text-brgr-gold">{formatPrice(cart.total_egp)}</span>
        </div>
      </div>
    </div>
  );
}

function CartLineRow({
  line,
  language,
  onRemoveLine,
}: {
  line: CartLine;
  language: Language;
  onRemoveLine: (lineId: string) => void;
}) {
  const t = copy[language];
  const addOns = line.modifiers?.add_ons?.map((item) => item.name).join(", ");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: language === "ar" ? 16 : -16 }}
      className="rounded-lg border border-white/10 bg-black/30 p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black leading-tight text-white">
            {line.quantity}x {line.name}
          </p>
          <p className="mt-1 text-xs font-semibold text-brgr-muted">{formatPrice(line.unit_price)} each</p>
        </div>
        <button
          type="button"
          onClick={() => onRemoveLine(line.line_id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded border border-white/15 bg-brgr-surface text-brgr-muted transition hover:border-brgr-gold/60 hover:text-brgr-gold"
          title={t.remove}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {line.modifiers?.bun || addOns || line.notes ? (
        <div className="mt-3 space-y-1 text-xs font-semibold text-brgr-muted">
          {line.modifiers?.bun ? <p>{line.modifiers.bun}</p> : null}
          {addOns ? <p>{addOns}</p> : null}
          {line.notes ? <p>{line.notes}</p> : null}
        </div>
      ) : null}
    </motion.div>
  );
}
