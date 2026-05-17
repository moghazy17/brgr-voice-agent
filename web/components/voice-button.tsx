"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { AudioWaveform, Loader2, Mic, PhoneOff } from "lucide-react";
import { clsx } from "clsx";
import { handleConversationMessage, extractConversationId } from "@/lib/conversation-events";
import { copy } from "@/lib/i18n";
import { useBrgrStore } from "@/lib/store";
import type { Language } from "@/lib/types";

type VoiceButtonProps = {
  className?: string;
  size?: "hero" | "compact";
};

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function VoiceButton({ className, size = "hero" }: VoiceButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const language = useBrgrStore((state) => state.language);
  const agentStatus = useBrgrStore((state) => state.agentStatus);
  const setAgentStatus = useBrgrStore((state) => state.setAgentStatus);
  const setAgentError = useBrgrStore((state) => state.setAgentError);
  const setConversationId = useBrgrStore((state) => state.setConversationId);
  const clearCart = useBrgrStore((state) => state.clearCart);
  const t = copy[language];

  const conversation = useConversation({
    onConnect: (event: unknown) => {
      const conversationId = extractConversationId(event);
      if (conversationId) {
        setConversationId(conversationId);
      }

      setIsStarting(false);
      setAgentStatus("listening");
      setAgentError(null);
    },
    onDisconnect: () => {
      setIsStarting(false);
      setAgentStatus("idle");
    },
    onMessage: (message: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[brgr][onMessage]", message);
      }
      handleConversationMessage(message);
    },
    onAgentToolRequest: (message: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[brgr][onAgentToolRequest]", message);
      }
      handleConversationMessage(message);
    },
    onAgentToolResponse: (message: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[brgr][onAgentToolResponse]", message);
      }
      handleConversationMessage(message);
    },
    onConversationMetadata: (message: unknown) => {
      const conversationId = extractConversationId(message);
      if (conversationId) {
        setConversationId(conversationId);
      }
    },
    onError: (error: unknown) => {
      setIsStarting(false);
      setAgentStatus("idle");
      setAgentError(error instanceof Error ? error.message : typeof error === "string" ? error : t.agentError);
    },
  });

  const rawStatus = String((conversation as { status?: string }).status ?? "disconnected");
  const isSpeaking = Boolean((conversation as { isSpeaking?: boolean }).isSpeaking);
  const isConnected = rawStatus === "connected";

  // When the user toggles UI language mid-call, restart the session so
  // ElevenLabs picks up the new language preset (and plays its welcome).
  // Cart is keyed by conversation_id on the backend, so it resets — user
  // confirmed this trade-off in favor of hearing the per-language welcome.
  const lastLanguageRef = useRef<Language>(language);
  const pendingRestartRef = useRef(false);
  useEffect(() => {
    if (lastLanguageRef.current === language) {
      return;
    }
    lastLanguageRef.current = language;

    if (!isConnected || !agentId) {
      return;
    }

    pendingRestartRef.current = true;
    setAgentStatus("connecting");
    setAgentError(null);
    clearCart();
    setConversationId(null);
    conversation.endSession();
  }, [language, isConnected, conversation, setAgentStatus, setAgentError, clearCart, setConversationId]);

  // After the disconnect from a language-toggle restart completes, kick off
  // a fresh session with the new language override.
  useEffect(() => {
    if (!pendingRestartRef.current || isConnected || isStarting) {
      return;
    }
    pendingRestartRef.current = false;

    if (!agentId) {
      return;
    }

    setIsStarting(true);
    setAgentError(null);

    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        conversation.startSession({
          agentId,
          connectionType: "webrtc",
          overrides: {
            agent: {
              language,
            },
          },
        });
      } catch (error) {
        setIsStarting(false);
        setAgentStatus("idle");
        setAgentError(error instanceof Error ? error.message : t.agentError);
      }
    })();
  }, [isConnected, isStarting, language, conversation, setAgentError, setAgentStatus, t.agentError]);

  useEffect(() => {
    if (isStarting) {
      setAgentStatus("connecting");
      return;
    }

    if (!isConnected) {
      if (pendingRestartRef.current) {
        setAgentStatus("connecting");
        return;
      }
      setAgentStatus("idle");
      return;
    }

    setAgentStatus(isSpeaking ? "speaking" : "listening");
  }, [isConnected, isSpeaking, isStarting, setAgentStatus]);

  const label = useMemo(() => (isConnected ? t.end : t.talk), [isConnected, t.end, t.talk]);
  const statusLabel = t[agentStatus] ?? t.idle;

  async function startConversation() {
    if (!agentId) {
      setAgentError("Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID");
      return;
    }

    setIsStarting(true);
    setAgentError(null);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      conversation.startSession({
        agentId,
        connectionType: "webrtc",
        overrides: {
          agent: {
            language,
          },
        },
      });
    } catch (error) {
      setIsStarting(false);
      setAgentStatus("idle");
      setAgentError(error instanceof Error ? error.message : t.agentError);
    }
  }

  function endConversation() {
    conversation.endSession();
    setAgentStatus("idle");
  }

  function handleClick() {
    if (isConnected) {
      endConversation();
      return;
    }

    void startConversation();
  }

  const isActive = isConnected || isStarting;
  const ringState = agentStatus === "speaking" ? "is-speaking" : isActive ? "is-listening" : "";

  const Icon = isStarting || agentStatus === "connecting"
    ? Loader2
    : isConnected
      ? PhoneOff
      : agentStatus === "speaking"
        ? AudioWaveform
        : Mic;

  if (size === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        title={label}
        className={clsx(
          "relative grid aspect-square w-14 place-items-center rounded-full border-2 border-brgr-ink bg-brgr-mustard text-brgr-ink shadow-chip transition hover:-translate-y-0.5",
          className,
        )}
      >
        <Icon className={clsx("h-6 w-6", Icon === Loader2 && "animate-spin")} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={clsx(
        "group relative isolate grid h-[148px] w-[148px] place-items-center rounded-full focus:outline-none",
        className,
      )}
    >
      {/* Pulse rings */}
      <span className={clsx("orb-ring", ringState)} aria-hidden />
      <span className={clsx("orb-ring delay-2", ringState)} aria-hidden />
      <span className={clsx("orb-ring delay-3", ringState)} aria-hidden />

      {/* Outer ring */}
      <span
        className={clsx(
          "absolute inset-0 rounded-full border-[3px] border-brgr-ink transition",
          isActive ? "bg-brgr-red" : "bg-brgr-ink",
        )}
        aria-hidden
      />

      {/* Glow orb */}
      <span
        className={clsx(
          "relative z-10 grid h-[112px] w-[112px] place-items-center rounded-full orb-glow",
          isActive && "is-active",
          agentStatus === "speaking" && "animate-pulse",
        )}
      >
        <span className="grid h-[78px] w-[78px] place-items-center rounded-full border-2 border-brgr-ink bg-brgr-cream text-brgr-ink shadow-inner">
          <Icon className={clsx("h-10 w-10", Icon === Loader2 && "animate-spin")} aria-hidden />
        </span>
      </span>

      {/* Status pill */}
      <span
        className={clsx(
          "absolute -bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-brgr-ink px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-chip",
          isActive ? "bg-brgr-red text-brgr-cream" : "bg-brgr-mustard text-brgr-ink",
        )}
      >
        <span className="me-1 inline-block h-2 w-2 rounded-full align-middle"
          style={{
            background: isActive ? "#FFF6E5" : "#1A1410",
            boxShadow: isActive ? "0 0 8px #fff" : "none",
          }}
          aria-hidden
        />
        {statusLabel}
      </span>

      {/* Hover label */}
      <span className="sr-only">{label}</span>
    </button>
  );
}
