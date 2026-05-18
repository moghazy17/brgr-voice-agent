# Current Update - BRGR Voice Agent

Last updated: 2026-05-19

## Summary

The multi-item ordering issue is a frontend cart-sync/UI mirroring bug, not a webhook bug.

When the agent says something like "Added Buffalo CHKN and CHKN American", the UI fallback previously detected only the first menu item name in that sentence. That made the sidebar show one item even when ElevenLabs showed two successful `add_to_cart` tool calls.

## Current Agent

Use this ElevenLabs agent going forward:

```text
agent_9601kryj0wc7ehvsbbxcbw0ywst2
```

Local files currently point to this new agent:

- `agent/.agent-id`
- `agent/agents.json`
- `web/.env.local`

The older agent was:

```text
agent_4001krskr58efhfsw7z4m0r7t02x
```

Do not switch back to the old agent unless intentionally repairing stale ElevenLabs tool document references.

## Fixes Made

- Updated the agent prompt/tool description so `add_to_cart` is treated as one distinct menu item per call.
- Added prompt instructions: for multiple different items, call `add_to_cart` once per item, then call `view_cart` and verify.
- Updated backend webhook parsing to accept both snake_case and camelCase tool payloads:
  - `conversation_id` or `conversationId`
  - `menu_item_id` or `menuItemId`
  - `line_id` or `lineId`
  - `add_ons` or `addOns`
- Removed the frontend race where the app cleared the remote cart on connect.
- Updated cart sync to use the conversation id from tool events when available.
- Fixed transcript fallback in `web/lib/conversation-events.ts` to mirror all distinct menu item names found in a confirmation sentence, not just the first one.
- Updated client tools to accept both snake_case and camelCase args.

## Deployment Status

Deployed:

- Backend: `https://brgr-tools.vercel.app`
- Web: `https://brgr-demo.vercel.app`

The deployed web build was made with:

```text
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_9601kryj0wc7ehvsbbxcbw0ywst2
```

Important: Vercel env CLI commands were failing locally with `ECONNREFUSED 127.0.0.1:9`, so the persistent Vercel dashboard env value was not confirmed.

## Local-Only Cleanup Not Yet Deployed

There is a local deterministic agent-id cleanup:

- `web/lib/agent-config.ts`
- `web/components/voice-button.tsx`
- `web/components/app-providers.tsx`

This removes dependency on Vercel's saved env value by importing `BRGR_AGENT_ID` directly.

This cleanup passed `npm run typecheck` in `web`, but it was not deployed because work was interrupted before deployment.

## Verification Already Run

Passed:

```bash
cd web
npm run typecheck
```

Passed earlier:

```bash
cd backend
npm run typecheck
```

## Notes For Next Chat

If continuing from here:

1. Keep using `agent_9601kryj0wc7ehvsbbxcbw0ywst2`.
2. Deploy the local deterministic agent-id cleanup to `brgr-demo`.
3. Restore root `.vercel/project.json` to `brgr-tools` after any web deploy.
4. Test the exact scenario: ask the agent to add `Buffalo CHKN` and `CHKN American` together. Expected UI cart: two separate lines.

