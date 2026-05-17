"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { LanguageProvider } from "./language-provider";

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConversationProvider agentId={agentId}>
      <LanguageProvider>{children}</LanguageProvider>
    </ConversationProvider>
  );
}
