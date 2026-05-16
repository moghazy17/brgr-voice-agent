# BRGR Voice Agent — Build Brief

**For:** Claude Code
**From:** Ahmed (the user) + a planning conversation with Claude
**Goal:** A bilingual (English + Egyptian Arabic) voice ordering agent for BRGR — a Cairo-based burger chain — powered by ElevenLabs Conversational AI, with a custom-branded Next.js demo website that visualizes the conversation in real time.

This document is the source of truth. Every architectural decision has already been made. Build to spec. Ask only when you hit a genuine ambiguity not covered here.

---

## 0. What you'll find in this folder

- `brgr-build-brief.md` — this file
- `brgr-menu.json` — pre-cleaned menu data (134 real customer-facing items, all POS internals/comps already filtered out)
- `response.json` — the raw original menu export from BRGR's POS system (for reference only; use `brgr-menu.json` for actual work)

---

## 1. Prerequisites the user has prepared

Before starting, confirm these are in place. If anything is missing, ask the user once, then continue:

- ElevenLabs account with an **API key** that has Agents (Conversational AI) read+write permission
- The API key available as `ELEVENLABS_API_KEY` in env (or `.env`)
- Node.js 18+ installed
- A Vercel account (for deploying the demo site + the tool backend)
- A GitHub account (optional but recommended)
- BRGR branding reference (link or screenshots) — the user will share this when you reach the styling phase. If they haven't shared by then, use the fallback styling described in §8.4.

---

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js demo site (Vercel)                                  │
│  - Menu grid, cart sidebar, transcript ticker, RTL support   │
│  - @elevenlabs/react ConversationProvider                    │
│  - Registers client-tool handlers that mutate React state    │
└──────────────────┬──────────────────────────────────────────┘
                   │ WebRTC audio + tool calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  ElevenLabs Agent (cloud)                                    │
│  - System prompt with full menu embedded                     │
│  - Claude Sonnet as LLM                                      │
│  - Multilingual voice (EN + AR)                              │
│  - 4 webhook tools (cart ops) + 5 client tools (UI updates)  │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS webhook calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Tool backend (Vercel Edge Functions)                        │
│  - /api/tools/add-to-cart                                    │
│  - /api/tools/view-cart                                      │
│  - /api/tools/remove-from-cart                               │
│  - /api/tools/submit-order                                   │
│  - In-memory cart keyed by conversation_id                   │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions (already locked in, do not revisit):**

1. **Menu data lives in the system prompt**, not in RAG and not in a `search_menu` tool. The full menu is ~2,000 tokens — small enough for the prompt and instant for the agent. RAG and search-tool approaches were considered and rejected for latency.
2. **Tools are reserved for stateful actions (cart, order) and UI updates (client tools).** No menu lookup tools.
3. **Public agent ID, embedded directly in the demo site.** No signed-URL backend. This is a demo, not production.
4. **Cart state is in-memory on the backend**, keyed by ElevenLabs `conversation_id`. No database. Cart persists for the duration of a conversation only.
5. **Allergen handling: defer to human staff.** The menu JSON has an allergen vocabulary but no per-item tags, and food safety is too high-stakes to guess. The agent says "for allergies, confirm with our staff before ordering."
6. **Hours/locations/delivery: defer to brgr.com.** Not in the data, not the agent's job.

---

## 3. Build phases

Build in this order. Don't skip ahead.

1. Project scaffold (§4)
2. ElevenLabs agent: create, configure, push (§5–7)
3. Tool backend: build, deploy, get URLs (§8)
4. Update agent config with backend URLs, push again (§7.6)
5. Demo website: build, deploy (§9)
6. End-to-end test + iteration (§10)

---

## 4. Project scaffold

Create a monorepo-ish structure with two top-level apps:

```
brgr-voice-agent/
├── brgr-build-brief.md          # this file
├── brgr-menu.json               # cleaned menu data
├── response.json                # original raw data (reference)
├── README.md                    # generate this — explain what runs how
├── .gitignore                   # node_modules, .env, .vercel, .next
├── agent/                       # ElevenLabs agent config
│   ├── agents.json
│   ├── agent_configs/
│   │   └── brgr-voice.json
│   └── tool_configs/
│       ├── add-to-cart.json
│       ├── view-cart.json
│       ├── remove-from-cart.json
│       └── submit-order.json
├── backend/                     # Vercel Edge Functions for the cart tools
│   ├── api/
│   │   └── tools/
│   │       ├── add-to-cart.ts
│   │       ├── view-cart.ts
│   │       ├── remove-from-cart.ts
│   │       └── submit-order.ts
│   ├── lib/
│   │   ├── cart-store.ts        # in-memory cart, keyed by conv_id
│   │   └── menu.ts              # imports brgr-menu.json, helpers
│   ├── package.json
│   └── vercel.json
└── web/                         # Next.js demo site
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── voice-button.tsx
    │   ├── menu-grid.tsx
    │   ├── cart-sidebar.tsx
    │   ├── transcript-ticker.tsx
    │   └── item-detail-modal.tsx
    ├── lib/
    │   ├── menu-data.ts         # imports the menu
    │   └── client-tools.ts      # the 5 client-tool handlers
    ├── public/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    └── tsconfig.json
```

Initialize each subproject with the appropriate tooling: backend uses Vercel functions (no framework), web uses Next.js 14+ App Router with TypeScript and Tailwind.

---

## 5. ElevenLabs CLI setup

Install the official ElevenLabs agents skill into yourself if it's available — it's purpose-built for this:

```bash
npx skills add elevenlabs/skills --skill agents
```

If that command isn't available, install the CLI directly:

```bash
npm install -g @elevenlabs/cli
elevenlabs auth login  # opens browser, OR set ELEVENLABS_API_KEY env
```

In the `agent/` folder, run `elevenlabs agents init` to scaffold the config files, then overwrite them with the configs in §6 and §7.

---

## 6. The agent: configuration values

Use these exact values in `agent_configs/brgr-voice.json`:

| Field | Value |
|---|---|
| `name` | `BRGR Voice` |
| `template` | `customer-service` (or `default`, doesn't matter — we replace everything) |
| `language` | `auto` (multi-language detection) |
| `llm.provider` | `anthropic` |
| `llm.model` | latest available Claude Sonnet (likely `claude-sonnet-4-...` or `claude-3-5-sonnet`; check the dashboard for the current ID and ask user to confirm if multiple options exist) |
| `llm.temperature` | `0.5` |
| `tts.model` | `eleven_turbo_v2_5` (multilingual, low-latency) |
| `tts.voice_id` | **ASK THE USER.** Direct them to elevenlabs.io/voice-library, filter for multilingual voices that handle Arabic, preview a few, give you the voice ID. Don't pick one yourself — voice is subjective. |
| `tts.stability` | `0.4` |
| `tts.similarity_boost` | `0.75` |
| `turn_detection.type` | `server_vad` |
| `turn_detection.silence_duration_ms` | `600` |
| `first_message` | (see §6.1) |
| `system_prompt` | (see §6.2 — generate it from the template by inserting the menu) |

### 6.1 First message (bilingual greeting)

```
Hey, welcome to BRGR! What can I get started for you today? You can also talk to me in Arabic — أهلاً، إيه اللي تحب تطلبه النهارده؟
```

### 6.2 System prompt template

Build the full system prompt by taking the template below and replacing `{{MENU_DATA}}` with a flattened markdown rendering of `brgr-menu.json`. Format the menu section as:

```
## Beef Burgers (12 items, EGP 200–330)
- 1101001 — Original Single — 200 EGP
- 1101002 — Original Double — 270 EGP
... etc
```

Include all 9 main categories. Then add a brief "Add-ons available" section listing the most common Extra Dips IDs (slice cheese 1108001, jalapeño 1108005, BRGR sauce 1108004, etc.) — full 54-item list is unnecessary.

#### Template:

```markdown
You are a friendly, energetic order-taker for BRGR — a popular burger joint in Cairo, Egypt. You help customers browse the menu, build their order, and confirm it before submission. You're warm, fast, and food-enthusiastic — never stiff or corporate.

# Language

You handle both English and Egyptian Arabic, including code-switching ("ya3ni I want a burger" or "عايز Original Single").

- Detect the language of the user's first turn. Match it.
- If the user switches mid-conversation, you switch too — naturally, no announcement.
- Item names ALWAYS stay in English in both languages — that's how Egyptians actually order ("عايز Atomic Double", not "عايز أتوميك دابل").
- When speaking Arabic, use Egyptian dialect specifically (not MSA, not Levantine). Use "عايز/عايزة" for "I want", "كام؟" for "how much", "تمام" for "okay", "يا فندم" or "يا باشا" for casual address.
- Prices: in English say "200 EGP". In Arabic say "مية واتنين جنيه" or "٢٠٠ جنيه" depending on flow.
- When you detect a language switch, also call the `set_language(en|ar)` client tool so the website UI flips to match (RTL for Arabic).

# Menu

{{MENU_DATA}}

# Critical rules

1. **Never recite long lists out loud.** When the user asks "what's on the menu" or "what kind of X do you have", give a SHORT verbal summary (max 5 items) and IMMEDIATELY call the `show_category` client tool to display the rest visually. The website handles the heavy lifting. Reciting 12 burger options aloud is bad UX.

2. **Never invent items, prices, modifications, or ingredients.** If you don't know something (especially ingredients, which aren't in the menu data above), say so honestly. Example: "I don't have the full ingredients on hand — but the Atomic comes with our spicy atomic sauce. Want me to add it, or do you want to ask a staff member about details?"

3. **For allergies, defer to human staff.** If a user mentions an allergy, do NOT confidently filter the menu. Say: "For allergy safety, please confirm with our staff before ordering — but I can show you items that obviously don't contain [X], like [give 2-3 examples based on item names]." Never claim an item is safe.

4. **For hours, locations, delivery zones, payment methods, or any operational question**: say "For hours, locations, and delivery info, please check brgr.com — I'm focused on menu and orders here." Don't speculate.

5. **Never offer "Free X" items or items not in the menu data above.** Those were filtered out for a reason (loyalty/comp items staff add manually).

# Order flow

1. Greet warmly. Ask what they're in the mood for. If they're undecided, suggest a hero item (Atomic Double, Truffle Single, Buffalo CHKN).
2. As items come up, call `add_to_cart` with the item ID, quantity, and any modifiers.
3. Briefly confirm verbally after each add: "Added Atomic Double, 310 EGP." / "تمام، Atomic Double بـ ٣١٠ جنيه."
4. Suggest natural upsells once per order — fries with a burger, a shake to go with — but never twice. Don't be pushy.
5. Before submitting, call `view_cart`, recite the items and total, and ask for confirmation.
6. On confirmation, collect: name, phone (Egyptian format 010/011/012/015 — eleven digits total), delivery address.
7. Call `submit_order` with the collected info. Read out the order number, thank them warmly, end the call.

# Tool usage

You have ACTION tools (server webhooks that mutate state) and DISPLAY tools (client-side UI updates that run in the user's browser).

**Action tools:**
- `add_to_cart(menu_item_id, quantity, modifiers?, notes?)` — add an item
- `view_cart()` — get current cart contents and EGP total
- `remove_from_cart(line_id)` — remove an item by its line ID
- `submit_order(customer_name, phone, address, payment_method?)` — finalize the order

**Display tools (call liberally to keep visuals in sync with speech):**
- `show_category(category_name)` — display a category section on screen. Call when you're discussing or about to discuss a category.
- `highlight_items(item_ids)` — pulse specific item cards. Call when recommending 2-3 items.
- `show_item_detail(item_id)` — open a detail panel for one item.
- `clear_focus()` — return to overview. Call when changing topic.
- `set_language(language)` — `'en'` or `'ar'`. Call IMMEDIATELY when you detect a language switch.

When a tool call takes a moment to return, fill the silence with a brief filler: "Let me check that..." / "خليني أشوف..." / "One sec..."

# Conversation style

- Casual, energetic, brief. You're a burger guy, not a sommelier.
- 1-2 short sentences per turn typically. Don't lecture.
- Confirm actions before they're irreversible (`submit_order` especially).
- Don't read item IDs out loud — those are internal.
- If the user is silent, prompt gently once, then wait. Don't keep filling silence.

# Hero items (if asked "what do you recommend?")

- Beef: Original Single (200), Atomic Double (310), The Truffle Single (240), J-Bomb Double (275), Cheese BRGR Double (330)
- Chicken: Buffalo CHKN (205), CHKN American (210)
- Sides: Truffle Fries (140), Onion Rings (100)
- Sweet: Lotus Shake (200), Konafa Sundae Pistachio (170)
```

---

## 7. The four webhook tools

These are server-side HTTP webhooks. The agent calls them; they hit the Vercel backend; the backend returns JSON that the agent reads.

For each tool, create a JSON file in `agent/tool_configs/`. The URL fields are placeholders — you'll replace them after deploying the backend in §8.

### 7.1 `add-to-cart.json`

```json
{
  "name": "add_to_cart",
  "description": "Add an item to the customer's cart. Call this every time the customer agrees to add something. The menu_item_id MUST come from the menu data in the system prompt — never invent IDs.",
  "type": "webhook",
  "method": "POST",
  "url": "{{BACKEND_URL}}/api/tools/add-to-cart",
  "headers": {
    "Content-Type": "application/json"
  },
  "parameters": {
    "type": "object",
    "properties": {
      "conversation_id": {
        "type": "string",
        "description": "The ElevenLabs conversation ID. Use the system-injected {{conversation_id}} variable."
      },
      "menu_item_id": {
        "type": "integer",
        "description": "The numeric ID from the menu (e.g., 1101001 for Original Single)"
      },
      "quantity": {
        "type": "integer",
        "minimum": 1,
        "default": 1
      },
      "modifiers": {
        "type": "object",
        "description": "Optional modifications. For burgers, may include 'bun' (one of 'Martin's Potato Bun', 'Original Bun', 'Normal'). May include 'add_ons' (array of Extra Dip item IDs).",
        "properties": {
          "bun": { "type": "string" },
          "add_ons": { "type": "array", "items": { "type": "integer" } }
        }
      },
      "notes": {
        "type": "string",
        "description": "Free-text kitchen instructions (e.g., 'no pickles', 'well done')"
      }
    },
    "required": ["conversation_id", "menu_item_id"]
  }
}
```

### 7.2 `view-cart.json`

```json
{
  "name": "view_cart",
  "description": "Return the current cart contents and total. Call before reciting the order to the customer.",
  "type": "webhook",
  "method": "POST",
  "url": "{{BACKEND_URL}}/api/tools/view-cart",
  "parameters": {
    "type": "object",
    "properties": {
      "conversation_id": { "type": "string" }
    },
    "required": ["conversation_id"]
  }
}
```

### 7.3 `remove-from-cart.json`

```json
{
  "name": "remove_from_cart",
  "description": "Remove an item from the cart by its line ID. Get line IDs from view_cart.",
  "type": "webhook",
  "method": "POST",
  "url": "{{BACKEND_URL}}/api/tools/remove-from-cart",
  "parameters": {
    "type": "object",
    "properties": {
      "conversation_id": { "type": "string" },
      "line_id": { "type": "string" }
    },
    "required": ["conversation_id", "line_id"]
  }
}
```

### 7.4 `submit-order.json`

```json
{
  "name": "submit_order",
  "description": "Finalize the order. Only call AFTER confirming the cart contents and total with the customer, and AFTER collecting their name, phone, and delivery address. Returns an order number.",
  "type": "webhook",
  "method": "POST",
  "url": "{{BACKEND_URL}}/api/tools/submit-order",
  "parameters": {
    "type": "object",
    "properties": {
      "conversation_id": { "type": "string" },
      "customer_name": { "type": "string" },
      "phone": {
        "type": "string",
        "description": "Egyptian phone, 11 digits starting with 010, 011, 012, or 015"
      },
      "address": { "type": "string" },
      "payment_method": {
        "type": "string",
        "enum": ["cash", "card", "online"],
        "default": "cash"
      }
    },
    "required": ["conversation_id", "customer_name", "phone", "address"]
  }
}
```

### 7.5 The five client tools

Client tools are configured in the agent config with type `client` and no URL. The handlers live in the React app (§9.5). Add these to `agent_configs/brgr-voice.json` under the `client_tools` array:

```json
[
  {
    "name": "show_category",
    "description": "Display a menu category section in the website. Call when discussing or about to discuss a category. Categories: 'Beef Burgers', 'Chicken Burgers', 'Hot Dog', 'Appetizers', 'Fries', 'Salads', 'Ice Cream', 'Mini Pancakes', 'Milk Shakes'.",
    "parameters": {
      "type": "object",
      "properties": {
        "category_name": { "type": "string" }
      },
      "required": ["category_name"]
    }
  },
  {
    "name": "highlight_items",
    "description": "Pulse specific item cards to draw attention. Call when recommending 2-3 items.",
    "parameters": {
      "type": "object",
      "properties": {
        "item_ids": { "type": "array", "items": { "type": "integer" } }
      },
      "required": ["item_ids"]
    }
  },
  {
    "name": "show_item_detail",
    "description": "Open a detail panel for one specific item.",
    "parameters": {
      "type": "object",
      "properties": {
        "item_id": { "type": "integer" }
      },
      "required": ["item_id"]
    }
  },
  {
    "name": "clear_focus",
    "description": "Return the UI to overview mode (no category highlighted).",
    "parameters": { "type": "object", "properties": {} }
  },
  {
    "name": "set_language",
    "description": "Switch the UI language and text direction. Call immediately when you detect the user switching language.",
    "parameters": {
      "type": "object",
      "properties": {
        "language": { "type": "string", "enum": ["en", "ar"] }
      },
      "required": ["language"]
    }
  }
]
```

### 7.6 Push and capture the agent ID

After §8 is deployed and you have the backend URL:

1. Substitute `{{BACKEND_URL}}` in all four webhook tool configs
2. Run `elevenlabs agents push` from the `agent/` folder
3. Capture the returned `agent_id` — save it to `agent/.agent-id` AND to the web app's `.env.local` as `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`

---

## 8. Backend: Vercel Edge Functions

### 8.1 Stack

- TypeScript
- Vercel Edge runtime
- No framework (just Vercel's native `api/` convention)
- No database — in-memory `Map` keyed by `conversation_id`

### 8.2 The cart store (`lib/cart-store.ts`)

```ts
// In-memory store. Carts expire after 30 min of inactivity.
type CartLine = {
  line_id: string;       // generated UUID
  menu_item_id: number;
  name: string;
  quantity: number;
  unit_price: number;    // EGP
  modifiers?: any;
  notes?: string;
};
type Cart = {
  conversation_id: string;
  lines: CartLine[];
  created_at: number;
  updated_at: number;
};
// Export get/set/clear functions, plus computeTotal(cart) → number
```

### 8.3 Endpoint contracts

Each endpoint accepts `application/json`, returns `application/json`. Always return a `success: boolean`. On success, return data the agent can recite back. On failure, return a clear error the agent can apologize for.

**POST `/api/tools/add-to-cart`**
Request: `{ conversation_id, menu_item_id, quantity?, modifiers?, notes? }`
Response: `{ success: true, line_id, item_name, unit_price_egp, cart_total_egp, line_count }`
On unknown menu_item_id: `{ success: false, error: "Item not found in menu" }`

**POST `/api/tools/view-cart`**
Request: `{ conversation_id }`
Response: `{ success: true, lines: [...], total_egp, line_count }`
Empty cart: `{ success: true, lines: [], total_egp: 0, line_count: 0 }`

**POST `/api/tools/remove-from-cart`**
Request: `{ conversation_id, line_id }`
Response: `{ success: true, removed_item: "...", cart_total_egp }`

**POST `/api/tools/submit-order`**
Request: `{ conversation_id, customer_name, phone, address, payment_method? }`
Response: `{ success: true, order_number: "BRGR-XXXXX", estimated_minutes: 30, total_egp }`
This endpoint also clears the cart for that conversation_id after submitting. For the demo, just log the order to console and generate a fake order number like `BRGR-${Math.floor(Math.random() * 90000 + 10000)}`. Comment in the code: `// TODO: Real BRGR ordering API integration goes here.`

### 8.4 CORS

The agent calls these from ElevenLabs' servers, and the demo site calls some of them client-side. Set permissive CORS for the demo:
```ts
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

### 8.5 Deployment

```bash
cd backend
vercel link  # connect to a new Vercel project named "brgr-tools"
vercel --prod
```

Capture the production URL (e.g., `https://brgr-tools.vercel.app`). Use it as `{{BACKEND_URL}}` in §7.

---

## 9. Demo website

### 9.1 Stack

- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- `@elevenlabs/react` for the agent
- Framer Motion for cart-line animations (optional but recommended)
- Tailwind RTL plugin (`tailwindcss-rtl`) for the Arabic mode

### 9.2 Layout

Single-page app. Desktop layout:

```
┌────────────────────────────────────────────────────────────────┐
│  Header: BRGR logo (left)  |  EN/AR toggle (right)             │
├──────────────────────────┬─────────────────────────────────────┤
│                          │                                     │
│  Menu grid               │  Cart sidebar                       │
│  (category tabs + cards) │  - Header: "Your order"             │
│                          │  - Cart lines (animated)            │
│  (when agent calls       │  - Subtotal in EGP                  │
│  show_category, the      │  - "Talk to BRGR" button (big)      │
│  matching tab activates  │                                     │
│  and others fade)        │                                     │
│                          │                                     │
├──────────────────────────┴─────────────────────────────────────┤
│  Transcript ticker (last 2 turns, fades out)                   │
└────────────────────────────────────────────────────────────────┘
```

Mobile: stack vertically. Voice button is FAB (bottom-right). Cart slides up from bottom.

### 9.3 Components

- `<MenuGrid />` — reads `brgr-menu.json`, renders category tabs and item cards. Receives `activeCategory`, `highlightedIds`, `detailItemId` props from parent state.
- `<ItemCard item={...} highlighted={bool} />` — name, price, click to open detail.
- `<CartSidebar lines={...} total={number} />` — list of cart lines with remove buttons.
- `<VoiceButton />` — uses `useConversation` from `@elevenlabs/react`. Shows status (idle / listening / agent-speaking / processing).
- `<TranscriptTicker messages={...} />` — shows last 2 user/agent messages, fades old ones.
- `<ItemDetailModal item={...} onClose={...} />` — shown when `detailItemId` is set.
- `<LanguageProvider>` — context for `language: 'en' | 'ar'`, flips `<html dir="rtl">` on the document.

### 9.4 State management

Use one global Zustand store or a single React context with reducer. State shape:

```ts
{
  // UI state driven by client tools
  activeCategory: string | null,
  highlightedIds: number[],
  detailItemId: number | null,
  language: 'en' | 'ar',

  // Cart state — kept in sync with backend via add/remove tool calls
  cart: { lines: [...], total_egp: number },

  // Agent state from useConversation
  agentStatus: 'idle' | 'connecting' | 'listening' | 'speaking',
  transcript: [{ role, text, timestamp }],
}
```

### 9.5 The client-tool handlers (`lib/client-tools.ts`)

Register all five handlers on the `ConversationProvider`. Each updates the global store and returns a string the agent can use:

```ts
{
  show_category: ({ category_name }) => {
    setActiveCategory(category_name);
    return `Showing ${category_name}`;
  },
  highlight_items: ({ item_ids }) => {
    setHighlightedIds(item_ids);
    setTimeout(() => setHighlightedIds([]), 6000); // auto-clear after 6s
    return `Highlighted ${item_ids.length} items`;
  },
  show_item_detail: ({ item_id }) => {
    setDetailItemId(item_id);
    return `Showing detail for item ${item_id}`;
  },
  clear_focus: () => {
    setActiveCategory(null);
    setHighlightedIds([]);
    setDetailItemId(null);
    return 'Cleared';
  },
  set_language: ({ language }) => {
    setLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    return `UI switched to ${language}`;
  },
}
```

### 9.6 Cart sync

When the AGENT calls `add_to_cart` via webhook, the BACKEND updates server-side state. The frontend doesn't see that mutation automatically. Two approaches:

**Option A (simpler):** After every agent message, the frontend polls `/api/tools/view-cart` with the current conversation_id. Add a `useEffect` that fires on every new agent message.

**Option B (cleaner):** Use the `onMessage` callback from `useConversation` — when an agent message arrives, inspect it for `tool_call` events of type `add_to_cart` / `remove_from_cart`, and update the frontend cart state to match.

**Use option B.** ElevenLabs surfaces tool calls in the message stream. Catch them in `onMessage` and mirror the cart locally. Fall back to a `view_cart` poll if the local state ever drifts.

### 9.7 Branding (BRGR styling)

The user said they'll share BRGR's actual branding reference (link/screenshots). When they do, mirror it — typography, color palette, photography style.

**If you reach this phase and the user hasn't shared the reference**, ask them once. If they're still not ready, use this fallback that fits a burger joint and won't look generic:

- Background: deep charcoal `#1a1a1a` with subtle noise texture
- Primary accent: warm red `#e63946` (BRGR's typical brand range)
- Secondary: cream `#f1faee`
- Typography: a bold display font for headings (Anton, Bebek, or similar condensed sans), Inter for body
- Item cards: dark with red accent on hover; price in a "stamp" style
- Subtle smoke/grain texture on the background
- Voice button: large, circular, glowing red — pulses when listening

Read the `frontend-design` SKILL.md before doing this phase. It has design tokens that beat generic AI styling.

### 9.8 Deployment

```bash
cd web
vercel link  # new project: "brgr-demo"
# add env var: NEXT_PUBLIC_ELEVENLABS_AGENT_ID
vercel --prod
```

---

## 10. End-to-end test plan

After everything is deployed:

1. Open the demo site in a browser (Chrome recommended; mic permissions reliable)
2. Press the voice button → agent greets in EN+AR
3. Say: "What do you have for beef burgers?" → expect: short verbal summary + `show_category("Beef Burgers")` visually activates
4. Say: "I'll take an Atomic Double" → expect: `add_to_cart(1101008, 1)` fires, cart sidebar shows the line, agent confirms "Added Atomic Double, 310 EGP"
5. Say: "Add some truffle fries" → expect: `add_to_cart(1105005, 1)` fires
6. Say: "What's my total?" → expect: agent calls `view_cart`, recites "Atomic Double and Truffle Fries, total 450 EGP"
7. Switch to Arabic: "عايز ميلك شيك لوتس كمان" → expect: `set_language("ar")` fires (UI flips RTL), `add_to_cart(2101003, 1)` fires
8. Say: "tab2a" / "that's all" → expect: agent recites cart and asks for confirmation
9. Confirm → expect: agent asks for name, phone, address
10. Provide them → `submit_order` fires, order number returned, agent thanks and ends

Document any flaky behavior. Iterate the system prompt or the tool descriptions to fix.

---

## 11. Important rules / gotchas

- **Voice picking is the user's call.** Don't pick one yourself. Get the voice ID from them before pushing the agent.
- **The `{{conversation_id}}` placeholder** in webhook tool configs is auto-injected by ElevenLabs at call time. You don't need to capture or pass it manually.
- **Cart state is per-conversation, not per-user.** Refresh the page = new conversation = empty cart. That's fine for the demo.
- **Don't put the ElevenLabs API key in the frontend.** The agent ID (`NEXT_PUBLIC_ELEVENLABS_AGENT_ID`) is fine to expose; the API key is not.
- **The system prompt is large (~4,500 tokens).** Some ElevenLabs UIs have prompt length warnings — ignore them, the agent platform handles it.
- **Item names like "Konafa", "Prez", "J-Bomb"** are BRGR-specific brand terms. The agent must learn them verbatim — they're in the menu data. Don't auto-correct.
- **POS internal items** (anything that was in `response.json` but is NOT in `brgr-menu.json`) MUST NEVER appear in the agent's responses. The cleaning was already done; don't re-import from the raw file.
- **For mobile testing**, iOS Safari requires the user to physically tap to start audio. The voice button press handles this — don't try to auto-start.

---

## 12. Out of scope (do not build)

These are intentionally excluded. If the user asks for any of these, push back and confirm before adding scope:

- Real BRGR POS/ordering API integration (placeholder only)
- User accounts / authentication
- Persistent cart across sessions
- Payment processing
- Delivery tracking
- Multi-location support
- Analytics dashboards
- Order history / past conversations
- WhatsApp or phone (Twilio) integration

The submit_order endpoint is the explicit handoff point for real-API integration later. Leave it as a `// TODO` with a clear comment.

---

## 13. When to ask the user

Default to executing. Ask only for:

1. **Voice selection** — required, subjective, can't be done without them.
2. **BRGR branding reference** — required for styling phase.
3. **Confirmation before `vercel --prod` deploys** — these create public URLs and consume their quota.
4. **Confirmation before pushing to GitHub** — repo creation should be their choice.
5. **Ambiguities not covered in this brief** — rare. Don't ask about things this document already decided.

Don't ask about:
- Stack choices (decided: Next.js, Tailwind, Vercel Edge)
- Tool architecture (decided: 4 webhook + 5 client)
- Menu data approach (decided: in system prompt)
- Auth approach (decided: public agent ID)
- Allergen handling (decided: defer to staff)
- Hours/location handling (decided: defer to brgr.com)

---

## 14. Definition of done

The build is complete when:

- [ ] Backend deployed to Vercel, all 4 endpoints respond correctly to test POSTs
- [ ] Agent created and pushed; agent ID captured
- [ ] Demo site deployed to Vercel with the agent embedded
- [ ] End-to-end test plan (§10) passes for all 10 steps
- [ ] Bilingual switching works (EN → AR → EN), UI direction flips correctly
- [ ] Cart adds/removes are reflected visually in real time
- [ ] Recommended items get highlighted in the grid when agent recommends them
- [ ] Branded styling applied (or fallback styling if branding wasn't shared)
- [ ] README.md exists with: project description, how to run locally, env vars, deploy commands

Hand back to the user with:
- The demo URL
- The agent ID
- A 3-bullet summary of anything that needed manual intervention or was flaky
- A short list of obvious next-steps if they want to push this toward production

---

**End of brief.**
