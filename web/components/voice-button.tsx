"use client";

import { useEffect, useMemo, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { AudioWaveform, Loader2, Mic, PhoneOff } from "lucide-react";
import { clsx } from "clsx";
import { clearRemoteCart } from "@/lib/cart-api";
import { handleConversationMessage, extractConversationId } from "@/lib/conversation-events";
import { copy } from "@/lib/i18n";
import { useBrgrStore } from "@/lib/store";

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
  const clearTranscript = useBrgrStore((state) => state.clearTranscript);
  const t = copy[language];

  const conversation = useConversation({
    onConnect: (event: unknown) => {
      const conversationId = extractConversationId(event);
      if (conversationId) {
        setConversationId(conversationId);
        void clearRemoteCart(conversationId)
          .catch((error) => {
            useBrgrStore
              .getState()
              .setCartSyncError(error instanceof Error ? error.message : "Could not reset cart");
          });
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
  useEffect(() => {
    if (isStarting) {
      setAgentStatus("connecting");
      return;
    }

    if (!isConnected) {
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
    setConversationId(null);
    clearCart();
    clearTranscript();

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

  const isBusy = isStarting || agentStatus === "connecting";

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

      {/* Soft halo behind the robot — colored by state */}
      <span
        className={clsx(
          "absolute inset-2 rounded-full transition-all duration-300",
          isActive
            ? "bg-brgr-red/25 shadow-[0_0_40px_8px_rgba(214,40,40,0.55)]"
            : "bg-brgr-mustard/25 shadow-[0_0_28px_4px_rgba(244,194,53,0.45)]",
          agentStatus === "speaking" && "animate-pulse",
        )}
        aria-hidden
      />

      {/* Robot — the orb */}
      <span
        className={clsx(
          "relative z-10 grid h-[140px] w-[140px] place-items-center transition-transform duration-300",
          isActive ? "scale-[1.02]" : "group-hover:-translate-y-0.5",
        )}
      >
        <img
          src="/robot.png"
          alt=""
          aria-hidden
          draggable={false}
          className={clsx(
            "h-full w-full select-none object-contain transition",
            isActive
              ? "drop-shadow-[0_6px_18px_rgba(214,40,40,0.55)]"
              : "drop-shadow-[0_6px_14px_rgba(26,20,16,0.45)]",
            agentStatus === "speaking" && "animate-bounce",
          )}
        />

        {/* Status icon overlay — only while busy / call active */}
        {isBusy || isConnected ? (
          <span
            className={clsx(
              "absolute -top-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-brgr-ink shadow-chip",
              isConnected ? "bg-brgr-red text-brgr-cream" : "bg-brgr-mustard text-brgr-ink",
            )}
            aria-hidden
          >
            <Icon className={clsx("h-4 w-4", Icon === Loader2 && "animate-spin")} />
          </span>
        ) : null}
      </span>

      {/* Status pill */}
      <span
        className={clsx(
          "absolute -bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-brgr-ink px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-chip",
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
