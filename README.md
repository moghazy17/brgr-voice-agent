# BRGR Voice Agent

Bilingual English/Egyptian Arabic voice ordering demo for BRGR, powered by ElevenLabs Conversational AI.

## Structure

- `agent/` - ElevenLabs agent and tool configuration.
- `backend/` - Vercel Edge Functions for cart and order tool webhooks.
- `web/` - Next.js demo website. Built in phase 5 after the backend and agent gates.
- `web/public/menu-images/` - 131 item images served as static assets from `/menu-images/<slug>.png`. Mapped to menu items via `web/lib/menu-images.ts`.
- `brgr-menu.json` - cleaned customer-facing menu data. This is the only menu source used by the agent and backend.

## Live deployments

- Demo UI: https://brgr-demo.vercel.app
- Tools backend (ElevenLabs webhook target, pinned to `fra1`): https://brgr-tools.vercel.app

## Environment

Create a local `.env` at the repo root or export:

```bash
ELEVENLABS_API_KEY=your_key_here
```

The public web app later uses:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_id_from_elevenlabs
```

Do not put `ELEVENLABS_API_KEY` in frontend code.

## Backend

```bash
cd backend
npm install
npm run typecheck
vercel link
vercel --prod
```

The production deploy command is intentionally gated. Run it only after approval.

## Agent

The agent prompt embeds `brgr-menu.json`; no RAG or menu search tool is used.

After backend deployment and voice selection:

```bash
cd agent
elevenlabs agents push
```

Save the returned agent ID to `agent/.agent-id` and to `web/.env.local` as `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.

## Web

```bash
cd web
npm install
npm run dev
npm run typecheck
npm run build
```

The web app uses the public ElevenLabs agent ID and browser client tools only.

Required env:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_id_from_elevenlabs
```

Optional env:

```bash
NEXT_PUBLIC_BRGR_BACKEND_URL=https://brgr-tools.vercel.app
```

For Vercel, create/link the website as a separate project from the backend and set Root Directory to `web`. The backend project is rooted at `backend`; do not leave the website project Root Directory as `.` in this monorepo.

Production deploy is intentionally gated:

```bash
cd web
vercel link
vercel --prod
```
