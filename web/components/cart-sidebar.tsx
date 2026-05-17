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
      {/* Desktop sidebar */}
      <section
        className="hidden h-full flex-col overflow-hidden rounded-[18px] border-[3px] border-brgr-ink bg-brgr-cream shadow-[8px_8px_0_0_#1A1410] md:flex"
        aria-label={t.order}
      >
        <CartContent cart={cart} language={language} onRemoveLine={onRemoveLine} />
      </section>

      {/* Mobile: floating chip above the orb dock */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="pointer-events-auto fixed start-4 z-30 flex items-center gap-2 rounded-full border-[3px] border-brgr-ink bg-brgr-cream px-3 py-2 shadow-chip"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 220px)" }}
          aria-label={t.order}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-brgr-ink bg-brgr-red text-brgr-cream">
            <ShoppingBag className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brgr-muted">
              {cart.line_count} {cart.line_count === 1 ? t.item : t.items}
            </span>
            <span className="font-display text-base text-brgr-ink">EGP {cart.total_egp}</span>
          </span>
        </button>

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                aria-label={t.close}
                className="fixed inset-0 z-[60] bg-brgr-ink/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.section
                className="fixed inset-x-0 bottom-0 z-[70] max-h-[82vh] overflow-hidden rounded-t-[24px] border-t-[3px] border-brgr-ink bg-brgr-cream shadow-panel"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                aria-label={t.order}
              >
                <div className="flex items-center justify-between border-b-2 border-dashed border-brgr-ink/30 bg-brgr-mustard px-4 py-3">
                  <h2 className="font-display text-2xl tracking-tight text-brgr-ink">{t.order}</h2>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-brgr-ink bg-brgr-cream text-brgr-ink"
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
        <div className="relative border-b-2 border-dashed border-brgr-ink/30 bg-brgr-mustard p-4">
          <div className="halftone absolute inset-0 opacity-25" aria-hidden />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-ink/70">
              {language === "ar" ? "فاتورتك" : "Your tab"}
            </p>
            <h2 className="font-display text-3xl tracking-tight text-brgr-ink">{t.order}</h2>
            <p className="mt-1 text-xs font-bold text-brgr-ink/70">
              {cart.line_count} {cart.line_count === 1 ? t.item : t.items}
            </p>
          </div>
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
              className="grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-brgr-ink/40 bg-brgr-cream px-3 text-center text-sm font-bold text-brgr-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>
                <span className="block font-display text-2xl text-brgr-ink">{t.emptyCart}</span>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-brgr-muted">
                  {language === "ar" ? "كلم BRGR لتبدا" : "Tap the orb to begin"}
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t-2 border-dashed border-brgr-ink/30 bg-brgr-cream p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-muted">{t.total}</span>
          <span className="font-display text-3xl text-brgr-red">EGP {cart.total_egp}</span>
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
      className="rounded-[14px] border-2 border-brgr-ink bg-brgr-paper p-3 shadow-chip"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight tracking-tight text-brgr-ink">
            <span className="me-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brgr-red px-1.5 text-xs font-black text-brgr-cream">
              {line.quantity}×
            </span>
            {line.name}
          </p>
          <p className="mt-1 text-xs font-bold text-brgr-muted">{formatPrice(line.unit_price)} each</p>
        </div>
        <button
          type="button"
          onClick={() => onRemoveLine(line.line_id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-brgr-ink bg-brgr-cream text-brgr-ink transition hover:bg-brgr-red hover:text-brgr-cream"
          title={t.remove}
          aria-label={t.remove}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {line.modifiers?.bun || addOns || line.notes ? (
        <div className="mt-2 space-y-0.5 text-[11px] font-semibold text-brgr-muted">
          {line.modifiers?.bun ? <p>· {line.modifiers.bun}</p> : null}
          {addOns ? <p>· {addOns}</p> : null}
          {line.notes ? <p className="italic">"{line.notes}"</p> : null}
        </div>
      ) : null}
    </motion.div>
  );
}
