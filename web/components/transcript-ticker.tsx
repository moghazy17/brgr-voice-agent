"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic2, Radio } from "lucide-react";
import { clsx } from "clsx";
import type { Language, TranscriptMessage } from "@/lib/types";

type TranscriptTickerProps = {
  messages: TranscriptMessage[];
  language: Language;
  active: boolean;
};

const roleCopy: Record<Language, Record<"user" | "agent", string>> = {
  en: { user: "YOU", agent: "BRGR" },
  ar: { user: "أنت", agent: "BRGR" },
};

export function TranscriptTicker({ messages, language, active }: TranscriptTickerProps) {
  const latest = messages.filter((message) => message.role !== "tool").slice(-2);
  const visible = active && latest.length > 0;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.section
          key="transcript"
          aria-live="polite"
          dir={language === "ar" ? "rtl" : "ltr"}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          className="pointer-events-none w-[min(92vw,38rem)]"
        >
          <div className="pointer-events-auto relative overflow-hidden rounded-[18px] border-[3px] border-brgr-ink bg-brgr-cream shadow-[8px_8px_0_0_#1A1410]">
            {/* Receipt header */}
            <div className="flex items-center justify-between border-b-2 border-dashed border-brgr-ink/40 bg-brgr-mustard px-4 py-2">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-brgr-ink">
                <Radio className="h-3.5 w-3.5 animate-pulse text-brgr-red" aria-hidden />
                {language === "ar" ? "بث مباشر" : "Live transcript"}
              </span>
              <span className="font-mono text-[10px] font-bold text-brgr-ink/70">
                {language === "ar" ? "اخر رسالتين" : "LAST 2"}
              </span>
            </div>

            {/* Lines */}
            <ul className="divide-y-2 divide-dashed divide-brgr-ink/15 bg-brgr-cream">
              <AnimatePresence initial={false}>
                {latest.map((message) => (
                  <motion.li
                    key={message.id}
                    layout
                    initial={{ opacity: 0, x: language === "ar" ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <span
                      className={clsx(
                        "mt-[2px] inline-flex h-6 shrink-0 items-center gap-1 rounded-full border-2 border-brgr-ink px-2 text-[10px] font-black uppercase tracking-[0.15em]",
                        message.role === "agent"
                          ? "bg-brgr-red text-brgr-cream"
                          : "bg-brgr-ink text-brgr-mustard",
                      )}
                    >
                      <Mic2 className="h-3 w-3" aria-hidden />
                      {roleCopy[language][message.role === "agent" ? "agent" : "user"]}
                    </span>
                    <p
                      className={clsx(
                        "min-w-0 flex-1 text-[15px] font-semibold leading-snug text-brgr-ink",
                        language === "ar" && "font-arabic",
                      )}
                    >
                      {message.text}
                    </p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Receipt zigzag bottom */}
            <div
              aria-hidden
              className="h-3"
              style={{
                background:
                  "linear-gradient(-45deg, transparent 33.33%, #FFF6E5 33.33%, #FFF6E5 66.66%, transparent 66.66%), linear-gradient(45deg, transparent 33.33%, #FFF6E5 33.33%, #FFF6E5 66.66%, transparent 66.66%)",
                backgroundSize: "12px 12px",
                backgroundColor: "#1A1410",
              }}
            />
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
