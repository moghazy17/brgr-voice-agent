"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { Language, TranscriptMessage } from "@/lib/types";

type TranscriptTickerProps = {
  messages: TranscriptMessage[];
  language: Language;
};

export function TranscriptTicker({ messages, language }: TranscriptTickerProps) {
  const latest = messages.filter((message) => message.role !== "tool").slice(-2);

  return (
    <section
      className="pointer-events-none fixed inset-x-0 bottom-16 z-20 mx-auto max-w-7xl px-4 sm:px-6 md:bottom-4 lg:px-8"
      aria-live="polite"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl space-y-2">
        <AnimatePresence initial={false}>
          {latest.map((message) => (
            <motion.div
              key={message.id}
              className="pointer-events-auto flex max-w-full items-start gap-2 rounded-lg border border-white/10 bg-[rgba(35,35,39,0.92)] px-3 py-2 text-sm font-semibold text-brgr-text shadow-panel backdrop-blur"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brgr-gold" aria-hidden />
              <span className="min-w-0 truncate">
                <span className="me-2 text-xs font-black uppercase text-brgr-gold">{message.role}</span>
                {message.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
