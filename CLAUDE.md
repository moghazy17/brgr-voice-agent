# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (English + Egyptian Arabic) voice ordering demo for BRGR, a Cairo burger chain. Three independently-deployed pieces share one menu source. `brgr-build-brief.md` is the authoritative spec — every architectural decision is locked there; build to spec rather than redesigning.

## Repository layout

This repo (`brgr-voice-agent/`) is the git root. It contains three sub-apps that deploy separately:

- `agent/` — ElevenLabs agent + tool configs (pushed via `elevenlabs agents push`)
- `backend/` — Vercel Edge Functions for cart/order webhooks → deployed as Vercel project `brgr-tools`
- `web/` — Next.js 14 App Router demo site → deployed as Vercel project `brgr-demo`

`brgr-menu.json` (repo root) is the single source of truth for menu data — 134 cleaned customer-facing items. `response.json` is the raw POS export; never import from it. Items absent from `brgr-menu.json` (POS/comp items) must never surface anywhere.

## Commands

```bash
# Backend
cd backend && npm install && npm run typecheck      # tsc --noEmit
# Web
cd web && npm install
npm run dev          # next dev
npm run build        # next build (run before claiming web work is done)
npm run typecheck    # tsc --noEmit
# Agent (after backend deploy + voice ID)
cd agent && elevenlabs agents push
```

No test suite exists. Verification = `typecheck` + `build` + a live visual/functional check.

## Menu data pipeline (important, non-obvious)

The root `brgr-menu.json` is **not** imported across folder boundaries at runtime — Vercel deploys each sub-app from its own directory, so `../../brgr-menu.json` fails to resolve in CI builds. Instead, the menu is vendored into each app:

- `scripts/generate-agent-config.mjs` reads root menu → writes `agent/agent_configs/brgr-voice.json` (menu embedded in the system prompt; no RAG, no menu-search tool)
- `scripts/generate-backend-menu-data.mjs` reads root menu → writes `backend/lib/menu-data.ts`
- `web/lib/brgr-menu.json` is a committed copy; `web/lib/menu-data.ts` imports it locally as `./brgr-menu.json`

If you change `brgr-menu.json`, re-run the generate scripts and re-copy into `web/lib/` — editing the root file alone changes nothing deployed.

## Architecture

**Tool split:** the agent has 4 webhook (action) tools — `add_to_cart`, `view_cart`, `remove_from_cart`, `submit_order` — and 5 client (UI) tools — `show_category`, `highlight_items`, `show_item_detail`, `clear_focus`, `set_language`. Webhook tools hit the backend server-to-server; client tools run in the browser. Don't add menu-lookup tools — the menu lives in the prompt by design.

**Backend:** `backend/api/tools/[action].ts` is a single Edge dynamic route that dispatches on the last path segment (not 4 separate files — intentional). Cart state is an in-memory `Map` in `lib/cart-store.ts` keyed by ElevenLabs `conversation_id`; no DB, no persistence across conversations. `submit_order` is a stub with a `// TODO` for real POS integration — leave it stubbed.

**Web:** single-page app. Global state is one Zustand store (`web/lib/store.ts`). The browser connects directly to ElevenLabs via `@elevenlabs/react` using the public `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` (no signed-URL backend — public agent by design). Cart sync is event-driven: `web/lib/conversation-events.ts` inspects the `onMessage` tool-call stream and mirrors cart mutations into the store, with a `view_cart` poll fallback (`web/lib/cart-sync.ts`). Client-tool handlers are registered in `web/lib/client-tools.ts`. Arabic mode flips `<html dir>` to RTL via `language-provider.tsx` + `tailwindcss-rtl`.

## Deployment gotchas

- **Monorepo Root Directory:** each Vercel project's Root Directory MUST be set (`brgr-demo` → `web`, `brgr-tools` → `backend`). If left as `.`, CLI deploys still work (they upload cwd) but git-triggered auto-deploys build the wrong folder and fail. This is set via the Vercel API/dashboard, not the CLI.
- Production deploys (`vercel --prod`) and GitHub pushes are intentionally gated — confirm with the user before running them.
- `ELEVENLABS_API_KEY` (env/`.env`) is server/CLI only. `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is the only ElevenLabs value allowed in frontend code.
- After an agent push, the agent ID goes in both `agent/.agent-id` and `web/.env.local`.

## Out of scope

Real POS integration, auth, persistent carts, payments, delivery tracking, multi-location, analytics, WhatsApp/Twilio. Push back before adding any of these (see brief §12).
