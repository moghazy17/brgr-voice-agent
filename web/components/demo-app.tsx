"use client";

import { Languages } from "lucide-react";
import { CartSidebar } from "@/components/cart-sidebar";
import { ItemDetailModal } from "@/components/item-detail-modal";
import { MenuGrid } from "@/components/menu-grid";
import { TranscriptTicker } from "@/components/transcript-ticker";
import { VoiceButton } from "@/components/voice-button";
import { removeLine, viewCart } from "@/lib/cart-api";
import { useRegisterClientTools } from "@/lib/client-tools";
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
  const setLanguage = useBrgrStore((state) => state.setLanguage);
  const setActiveCategory = useBrgrStore((state) => state.setActiveCategory);
  const setDetailItemId = useBrgrStore((state) => state.setDetailItemId);
  const setCart = useBrgrStore((state) => state.setCart);
  const removeCartLine = useBrgrStore((state) => state.removeCartLine);
  const setCartSyncError = useBrgrStore((state) => state.setCartSyncError);
  const t = copy[language];

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
    setLanguage(nextLanguage);
  }

  return (
    <main className="min-h-screen pb-28 md:pb-8" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(24,24,27,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-3xl font-black tracking-tight text-brgr-gold">BRGR</span>
            <span className="hidden text-sm font-medium text-brgr-muted sm:inline">Voice Demo</span>
          </div>

          <div className="flex items-center gap-2" aria-label={t.language}>
            <Languages className="h-4 w-4 text-brgr-muted" aria-hidden />
            {(["en", "ar"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleLanguageChange(option)}
                className={`h-9 min-w-11 rounded border px-3 text-sm font-semibold transition ${
                  language === option
                    ? "border-brgr-gold bg-brgr-gold text-brgr-goldink"
                    : "border-white/15 bg-brgr-surface text-brgr-text hover:border-brgr-gold/60"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <MenuGrid
          categories={categories}
          activeCategory={activeCategory}
          highlightedIds={highlightedIds}
          language={language}
          onCategorySelect={setActiveCategory}
          onItemSelect={setDetailItemId}
        />

        <aside className="md:sticky md:top-24 md:h-[calc(100vh-7rem)]">
          <CartSidebar cart={cart} language={language} onRemoveLine={handleRemoveLine} />
          <VoiceButton className="fixed bottom-20 end-4 z-40 md:static md:mt-4 md:w-full" />
        </aside>
      </div>

      <TranscriptTicker messages={transcript} language={language} />
      <ItemDetailModal itemId={detailItemId} language={language} onClose={() => setDetailItemId(null)} />
    </main>
  );
}
