"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { BRGR_AGENT_ID } from "@/lib/agent-config";
import { LanguageProvider } from "./language-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConversationProvider agentId={BRGR_AGENT_ID}>
      <LanguageProvider>{children}</LanguageProvider>
    </ConversationProvider>
  );
}
