"use client";

import { useEffect } from "react";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { CartSidebar } from "@/components/cart-sidebar";
import { ItemDetailModal } from "@/components/item-detail-modal";
import { MenuGrid } from "@/components/menu-grid";
import { TranscriptTicker } from "@/components/transcript-ticker";
import { VoiceButton } from "@/components/voice-button";
import { removeLine, viewCart } from "@/lib/cart-api";
import { useRegisterClientTools } from "@/lib/client-tools";
import { resetConversationEventState } from "@/lib/conversation-events";
import { copy } from "@/lib/i18n";
import { categories } from "@/lib/menu-data";
import { useBrgrStore } from "@/lib/store";
import type { Language } from "@/lib/types";

export function DemoApp() {
  useRegisterClientTools();

  const language = useBrgrStore((state) => state.language);
  const activeCategory = useBrgrStore((state) => state.activeCategory);
  const highlightedIds = useBrgrStore((state) => state.highlightedIds);
  const detailItemId = useBrgrStore((state) => state.detailItemId);
  const cart = useBrgrStore((state) => state.cart);
  const transcript = useBrgrStore((state) => state.transcript);
  const conversationId = useBrgrStore((state) => state.conversationId);
  const agentStatus = useBrgrStore((state) => state.agentStatus);
  const agentError = useBrgrStore((state) => state.agentError);
  const setLanguage = useBrgrStore((state) => state.setLanguage);
  const setActiveCategory = useBrgrStore((state) => state.setActiveCategory);
  const setDetailItemId = useBrgrStore((state) => state.setDetailItemId);
  const setCart = useBrgrStore((state) => state.setCart);
  const removeCartLine = useBrgrStore((state) => state.removeCartLine);
  const clearCart = useBrgrStore((state) => state.clearCart);
  const clearTranscript = useBrgrStore((state) => state.clearTranscript);
  const setConversationId = useBrgrStore((state) => state.setConversationId);
  const setCartSyncError = useBrgrStore((state) => state.setCartSyncError);
  const t = copy[language];
  const isActive = agentStatus !== "idle";

  useEffect(() => {
    clearCart();
    clearTranscript();
    setConversationId(null);
    resetConversationEventState();
  }, [clearCart, clearTranscript, setConversationId]);

  async function handleRemoveLine(lineId: string) {
    if (!conversationId) {
      removeCartLine(lineId);
      return;
    }

    try {
      await removeLine(conversationId, lineId);
      const syncedCart = await viewCart(conversationId);
      setCart(syncedCart);
    } catch (error) {
      setCartSyncError(error instanceof Error ? error.message : "Could not remove item");
    }
  }

  function handleLanguageChange(nextLanguage: Language) {
    if (isActive) {
      return;
    }

    setLanguage(nextLanguage);
  }

  const tagline = language === "ar" ? "اطلب بصوتك" : "Order with your voice";
  const sub = language === "ar"
    ? "اضغط على الزرار، كلم BRGR، وهنرتب لك طلبك."
    : "Tap the orb, talk to BRGR, and we'll build your order live.";

  return (
    <main
      className={`relative min-h-screen overflow-x-clip pb-[260px] md:pb-10 ${language === "ar" ? "font-arabic" : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* HEADER — bold diner signage */}
      <header className="sticky top-0 z-30 border-b-[3px] border-brgr-ink bg-brgr-cream/95 backdrop-blur">
        <div className="halftone-mustard h-1.5" aria-hidden />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-brgr-ink bg-brgr-red shadow-chip sm:h-16 sm:w-16">
              <img src="/brgr-logo.svg" alt="BRGR" className="h-11 w-11 sm:h-12 sm:w-12" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-display text-3xl tracking-tight text-brgr-ink sm:text-4xl">
                BRGR<span className="text-brgr-red">.</span>
              </span>
              <span className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-brgr-muted">
                {language === "ar" ? "صوت · تجربة" : "Voice · Demo"}
              </span>
            </div>
          </div>

          <LanguageSwitch language={language} onChange={handleLanguageChange} label={t.language} disabled={isActive} />
        </div>
      </header>

      {/* HERO STRIP — frames the orb's importance */}
      <section className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[20px] border-[3px] border-brgr-ink bg-brgr-mustard p-5 shadow-[8px_8px_0_0_#1A1410] sm:p-7">
          <div className="halftone absolute inset-0 opacity-30" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0 max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-brgr-ink bg-brgr-cream px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brgr-ink shadow-chip">
                <span className={`h-2 w-2 rounded-full ${isActive ? "bg-brgr-red animate-pulse" : "bg-brgr-ink"}`} />
                {isActive ? (language === "ar" ? "البث مباشر" : "Live now") : (language === "ar" ? "جاهز لطلبك" : "Ready when you are")}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-tight text-brgr-ink">
                {tagline.split(" ").map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? "text-brgr-red" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>
              <p className="mt-3 max-w-md text-base font-semibold text-brgr-ink/80">{sub}</p>
            </div>

            <div className="hidden flex-col items-end gap-2 text-end md:flex">
              <div className="rounded-2xl border-2 border-brgr-ink bg-brgr-cream px-4 py-3 shadow-chip">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-muted">
                  {language === "ar" ? "الفاتورة" : "Tab"}
                </p>
                <p className="font-display text-3xl text-brgr-ink">EGP {cart.total_egp}</p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brgr-ink/70">
                {cart.line_count} {cart.line_count === 1 ? t.item : t.items}
              </p>
            </div>
          </div>
        </div>

        {agentError ? (
          <div className="mt-3 rounded-lg border-2 border-brgr-red bg-brgr-red/10 px-4 py-2 text-sm font-bold text-brgr-red">
            {agentError}
          </div>
        ) : null}
      </section>

      {/* MARQUEE */}
      <div className="mt-6 overflow-hidden border-y-[3px] border-brgr-ink bg-brgr-ink py-2 diner-ticker-mask">
        <div className="marquee whitespace-nowrap font-display text-2xl tracking-[0.08em] text-brgr-mustard">
          {Array.from({ length: 2 }).map((_, group) => (
            <span key={group} className="flex shrink-0 items-center">
              {["FRESH OFF THE GRILL", "★", "VOICE ORDERING", "★", "EGYPTIAN ARABIC", "★", "TAP THE ORB", "★", "DOUBLE-PATTY READY", "★"].map((word, i) => (
                <span key={i} className="px-6">
                  {word === "★" ? <span className="text-brgr-red">★</span> : word}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,1fr)_19rem] lg:px-8">
        <MenuGrid
          categories={categories}
          activeCategory={activeCategory}
          highlightedIds={highlightedIds}
          language={language}
          onCategorySelect={setActiveCategory}
          onItemSelect={setDetailItemId}
        />

        <aside className="relative z-30 flex flex-col gap-3 md:sticky md:top-24 md:h-[calc(100vh-7rem)]">
          <div className="hidden md:block">
            <TranscriptTicker
              messages={transcript}
              language={language}
              active={isActive}
              variant="sidebar"
            />
          </div>
          <div className="min-h-0 flex-1 md:max-h-[58vh]">
            <CartSidebar cart={cart} language={language} onRemoveLine={handleRemoveLine} />
          </div>

          {/* Desktop: orb tucked under the cart */}
          <div className="hidden md:flex justify-end pt-2 pr-2">
            <VoiceButton />
          </div>
        </aside>
      </div>

      {/* ============ MOBILE FLOATING VOICE DOCK ============ */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-4 px-4 pb-6 sm:pb-8 md:hidden"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="w-full flex justify-center">
          <TranscriptTicker messages={transcript} language={language} active={isActive} />
        </div>

        <div className="pointer-events-auto relative">
          <div
            aria-hidden
            className="absolute -inset-x-12 -inset-y-2 -z-10 rounded-[100%] bg-brgr-cream/95 blur-md"
          />
          <VoiceButton />
        </div>
      </div>

      <ItemDetailModal itemId={detailItemId} language={language} onClose={() => setDetailItemId(null)} />
    </main>
  );
}

function LanguageSwitch({
  language,
  onChange,
  label,
  disabled,
}: {
  language: Language;
  onChange: (next: Language) => void;
  label: string;
  disabled?: boolean;
}) {
  const isAr = language === "ar";
  const next: Language = isAr ? "en" : "ar";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAr}
      disabled={disabled}
      aria-label={`${label}: ${isAr ? "العربية" : "English"}`}
      onClick={() => onChange(next)}
      className="relative grid h-10 grid-cols-2 items-center overflow-hidden rounded-full border-[3px] border-brgr-ink bg-brgr-cream shadow-chip transition enabled:active:translate-y-[1px] enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      style={{ width: 124 }}
    >
      <motion.span
        aria-hidden
        layout
        className="absolute inset-y-0 w-1/2 rounded-full bg-brgr-red"
        initial={false}
        animate={{ x: isAr ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
      />
      <span
        aria-hidden
        className={`pointer-events-none relative z-10 flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] transition-colors ${
          isAr ? "text-brgr-ink/55" : "text-brgr-cream"
        }`}
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        EN
      </span>
      <span
        aria-hidden
        className={`pointer-events-none relative z-10 flex items-center justify-center text-sm font-black tracking-tight transition-colors ${
          isAr ? "text-brgr-cream" : "text-brgr-ink/55"
        }`}
      >
        ع
      </span>
    </button>
  );
}
