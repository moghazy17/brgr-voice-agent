"use client";

import { useEffect, useMemo, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { AudioWaveform, Loader2, Mic, PhoneOff } from "lucide-react";
import { clsx } from "clsx";
import { handleConversationMessage, extractConversationId } from "@/lib/conversation-events";
import { copy } from "@/lib/i18n";
import { useBrgrStore } from "@/lib/store";

type VoiceButtonProps = {
  className?: string;
};

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function VoiceButton({ className }: VoiceButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const language = useBrgrStore((state) => state.language);
  const agentStatus = useBrgrStore((state) => state.agentStatus);
  const setAgentStatus = useBrgrStore((state) => state.setAgentStatus);
  const setAgentError = useBrgrStore((state) => state.setAgentError);
  const setConversationId = useBrgrStore((state) => state.setConversationId);
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
      handleConversationMessage(message);
    },
    onAgentToolRequest: (message: unknown) => {
      handleConversationMessage(message);
    },
    onAgentToolResponse: (message: unknown) => {
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

  const label = useMemo(() => {
    if (isConnected) {
      return t.end;
    }

    return t.talk;
  }, [isConnected, t.end, t.talk]);

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

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "grid aspect-square w-24 place-items-center rounded-full border border-brgr-gold bg-brgr-gold p-3 text-brgr-goldink shadow-panel transition hover:scale-[1.03] active:scale-[0.97] md:aspect-auto md:h-24 md:grid-cols-[auto_1fr] md:rounded-lg md:px-5 md:text-start",
        agentStatus === "listening" && "ring-4 ring-brgr-gold/45",
        agentStatus === "speaking" && "animate-pulse ring-4 ring-brgr-gold/70",
        className,
      )}
      title={label}
      aria-label={label}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-brgr-gold">
        {isStarting || agentStatus === "connecting" ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        ) : isConnected ? (
          <PhoneOff className="h-6 w-6" aria-hidden />
        ) : agentStatus === "speaking" ? (
          <AudioWaveform className="h-6 w-6" aria-hidden />
        ) : (
          <Mic className="h-6 w-6" aria-hidden />
        )}
      </span>

      <span className="hidden min-w-0 md:block">
        <span className="block text-base font-black leading-tight">{label}</span>
        <span className="mt-1 block text-sm font-semibold text-black/65">{statusLabel}</span>
      </span>
    </button>
  );
}
