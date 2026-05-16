import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const agentDir = path.join(root, "agent");

const menu = JSON.parse(await readFile(path.join(root, "brgr-menu.json"), "utf8"));

const categories = menu.categories ?? [];

function priceRange(category) {
  const range = category.price_range_egp;
  if (Array.isArray(range) && range.length === 2) {
    return `EGP ${range[0]}-${range[1]}`;
  }

  const prices = (category.items ?? []).map((item) => Number(item.price_egp)).filter(Number.isFinite);
  if (!prices.length) {
    return "EGP";
  }

  return `EGP ${Math.min(...prices)}-${Math.max(...prices)}`;
}

function renderMenu() {
  return categories
    .map((category) => {
      const title = `## ${category.name_en} (${category.item_count ?? category.items?.length ?? 0} items, ${priceRange(category)})`;
      const items = (category.items ?? [])
        .map((item) => `- ${item.id} - ${item.name} - ${item.price_egp} EGP`)
        .join("\n");
      return `${title}\n${items}`;
    })
    .join("\n\n");
}

const commonAddonIds = [
  1108001,
  1108002,
  1108003,
  1108004,
  1108005,
  1108016,
  1108017,
  1108033,
  1108036,
  1108052,
];

const addOns = (menu.extras_addons ?? [])
  .filter((item) => commonAddonIds.includes(item.id))
  .map((item) => `- ${item.id} - ${item.name} - ${item.price_egp} EGP`)
  .join("\n");

const systemPrompt = `You are a friendly, energetic order-taker for BRGR - a popular burger joint in Cairo, Egypt. You help customers browse the menu, build their order, and confirm it before submission. You're warm, fast, and food-enthusiastic - never stiff or corporate.

# Language

You handle both English and Egyptian Arabic, including code-switching ("ya3ni I want a burger" or "عايز Original Single").

- Detect the language of the user's first turn. Match it.
- If the user switches mid-conversation, you switch too - naturally, no announcement.
- Item names ALWAYS stay in English in both languages - that's how Egyptians actually order ("عايز Atomic Double", not "عايز أتوميك دابل").
- When speaking Arabic, use Egyptian dialect specifically (not MSA, not Levantine). Use "عايز/عايزة" for "I want", "كام؟" for "how much", "تمام" for "okay", "يا فندم" or "يا باشا" for casual address.
- Prices: in English say "200 EGP". In Arabic say "مية واتنين جنيه" or "٢٠٠ جنيه" depending on flow.
- When you detect a language switch, also call the \`set_language(en|ar)\` client tool so the website UI flips to match (RTL for Arabic).

# Menu

${renderMenu()}

## Add-ons available
Use these common add-ons when the customer asks for extras. Do not recite the full extras list out loud.
${addOns}

# Critical rules

1. **Never recite long lists out loud.** When the user asks "what's on the menu" or "what kind of X do you have", give a SHORT verbal summary (max 5 items) and IMMEDIATELY call the \`show_category\` client tool to display the rest visually. The website handles the heavy lifting. Reciting 12 burger options aloud is bad UX.

2. **Never invent items, prices, modifications, or ingredients.** If you don't know something (especially ingredients, which aren't in the menu data above), say so honestly. Example: "I don't have the full ingredients on hand - but the Atomic comes with our spicy atomic sauce. Want me to add it, or do you want to ask a staff member about details?"

3. **For allergies, defer to human staff.** If a user mentions an allergy, do NOT confidently filter the menu. Say: "For allergy safety, please confirm with our staff before ordering - but I can show you items that obviously don't contain [X], like [give 2-3 examples based on item names]." Never claim an item is safe.

4. **For hours, locations, delivery zones, payment methods, or any operational question**: say "For hours, locations, and delivery info, please check brgr.com - I'm focused on menu and orders here." Don't speculate.

5. **Never offer "Free X" items or items not in the menu data above.** Those were filtered out for a reason (loyalty/comp items staff add manually).

# Order flow

1. Greet warmly. Ask what they're in the mood for. If they're undecided, suggest a hero item (Atomic Double, Truffle Single, Buffalo CHKN).
2. As items come up, call \`add_to_cart\` with the item ID, quantity, and any modifiers.
3. Briefly confirm verbally after each add: "Added Atomic Double, 310 EGP." / "تمام، Atomic Double بـ ٣١٠ جنيه."
4. Suggest natural upsells once per order - fries with a burger, a shake to go with - but never twice. Don't be pushy.
5. Before submitting, call \`view_cart\`, recite the items and total, and ask for confirmation.
6. On confirmation, collect: name, phone (Egyptian format 010/011/012/015 - eleven digits total), delivery address.
7. Call \`submit_order\` with the collected info. Read out the order number, thank them warmly, end the call.

# Tool usage

You have ACTION tools (server webhooks that mutate state) and DISPLAY tools (client-side UI updates that run in the user's browser).

**Action tools:**
- \`add_to_cart(menu_item_id, quantity, modifiers?, notes?)\` - add an item
- \`view_cart()\` - get current cart contents and EGP total
- \`remove_from_cart(line_id)\` - remove an item by its line ID
- \`submit_order(customer_name, phone, address, payment_method?)\` - finalize the order

**Display tools (call liberally to keep visuals in sync with speech):**
- \`show_category(category_name)\` - display a category section on screen. Call when you're discussing or about to discuss a category.
- \`highlight_items(item_ids)\` - pulse specific item cards. Call when recommending 2-3 items.
- \`show_item_detail(item_id)\` - open a detail panel for one item.
- \`clear_focus()\` - return to overview. Call when changing topic.
- \`set_language(language)\` - 'en' or 'ar'. Call IMMEDIATELY when you detect a language switch.

When a tool call takes a moment to return, fill the silence with a brief filler: "Let me check that..." / "خليني أشوف..." / "One sec..."

# Conversation style

- Casual, energetic, brief. You're a burger guy, not a sommelier.
- 1-2 short sentences per turn typically. Don't lecture.
- Confirm actions before they're irreversible (\`submit_order\` especially).
- Don't read item IDs out loud - those are internal.
- If the user is silent, prompt gently once, then wait. Don't keep filling silence.

# Hero items (if asked "what do you recommend?")

- Beef: Original Single (200), Atomic Double (310), The Truffle Single (240), J-Bomb Double (275), Cheese BRGR Double (330)
- Chicken: Buffalo CHKN (205), CHKN American (210)
- Sides: Truffle Fries (140), Onion Rings (100)
- Sweet: Lotus Shake (200), Konafa Sundae Pistachio (170)
`;

const addToCartFlat = {
  name: "add_to_cart",
  description:
    "Add an item to the customer's cart. Call this every time the customer agrees to add something. The menu_item_id MUST come from the menu data in the system prompt - never invent IDs.",
  type: "webhook",
  method: "POST",
  url: "{{BACKEND_URL}}/api/tools/add-to-cart",
  headers: {
    "Content-Type": "application/json",
  },
  parameters: {
    type: "object",
    properties: {
      conversation_id: {
        type: "string",
        description: "The ElevenLabs conversation ID. Use the system-injected {{conversation_id}} variable.",
      },
      menu_item_id: {
        type: "integer",
        description: "The numeric ID from the menu (e.g., 1101001 for Original Single)",
      },
      quantity: {
        type: "integer",
        minimum: 1,
        default: 1,
      },
      modifiers: {
        type: "object",
        description:
          "Optional modifications. For burgers, may include 'bun' (one of 'Martin's Potato Bun', 'Original Bun', 'Normal'). May include 'add_ons' (array of Extra Dip item IDs).",
        properties: {
          bun: { type: "string" },
          add_ons: { type: "array", items: { type: "integer" } },
        },
      },
      notes: {
        type: "string",
        description: "Free-text kitchen instructions (e.g., 'no pickles', 'well done')",
      },
    },
    required: ["conversation_id", "menu_item_id"],
  },
};

const viewCartFlat = {
  name: "view_cart",
  description: "Return the current cart contents and total. Call before reciting the order to the customer.",
  type: "webhook",
  method: "POST",
  url: "{{BACKEND_URL}}/api/tools/view-cart",
  parameters: {
    type: "object",
    properties: {
      conversation_id: { type: "string" },
    },
    required: ["conversation_id"],
  },
};

const removeFromCartFlat = {
  name: "remove_from_cart",
  description: "Remove an item from the cart by its line ID. Get line IDs from view_cart.",
  type: "webhook",
  method: "POST",
  url: "{{BACKEND_URL}}/api/tools/remove-from-cart",
  parameters: {
    type: "object",
    properties: {
      conversation_id: { type: "string" },
      line_id: { type: "string" },
    },
    required: ["conversation_id", "line_id"],
  },
};

const submitOrderFlat = {
  name: "submit_order",
  description:
    "Finalize the order. Only call AFTER confirming the cart contents and total with the customer, and AFTER collecting their name, phone, and delivery address. Returns an order number.",
  type: "webhook",
  method: "POST",
  url: "{{BACKEND_URL}}/api/tools/submit-order",
  parameters: {
    type: "object",
    properties: {
      conversation_id: { type: "string" },
      customer_name: { type: "string" },
      phone: {
        type: "string",
        description: "Egyptian phone, 11 digits starting with 010, 011, 012, or 015",
      },
      address: { type: "string" },
      payment_method: {
        type: "string",
        enum: ["cash", "card", "online"],
        default: "cash",
      },
    },
    required: ["conversation_id", "customer_name", "phone", "address"],
  },
};

const clientTools = [
  {
    type: "client",
    name: "show_category",
    description:
      "Display a menu category section in the website. Call when discussing or about to discuss a category. Categories: 'Beef Burgers', 'Chicken Burgers', 'Hot Dog', 'Appetizers', 'Fries', 'Salads', 'Ice Cream', 'Mini Pancakes', 'Milk Shakes'.",
    parameters: {
      type: "object",
      properties: {
        category_name: { type: "string" },
      },
      required: ["category_name"],
    },
  },
  {
    type: "client",
    name: "highlight_items",
    description: "Pulse specific item cards to draw attention. Call when recommending 2-3 items.",
    parameters: {
      type: "object",
      properties: {
        item_ids: { type: "array", items: { type: "integer" } },
      },
      required: ["item_ids"],
    },
  },
  {
    type: "client",
    name: "show_item_detail",
    description: "Open a detail panel for one specific item.",
    parameters: {
      type: "object",
      properties: {
        item_id: { type: "integer" },
      },
      required: ["item_id"],
    },
  },
  {
    type: "client",
    name: "clear_focus",
    description: "Return the UI to overview mode (no category highlighted).",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "client",
    name: "set_language",
    description: "Switch the UI language and text direction. Call immediately when you detect the user switching language.",
    parameters: {
      type: "object",
      properties: {
        language: { type: "string", enum: ["en", "ar"] },
      },
      required: ["language"],
    },
  },
];

function webhookForAgent(tool) {
  return {
    type: "webhook",
    name: tool.name,
    description: tool.description,
    response_timeout_secs: 10,
    api_schema: {
      url: tool.url,
      method: tool.method,
      request_headers: tool.headers ?? { "Content-Type": "application/json" },
      request_body_schema: tool.parameters,
    },
  };
}

const webhookTools = [addToCartFlat, viewCartFlat, removeFromCartFlat, submitOrderFlat];

const agentConfig = {
  name: "BRGR Voice",
  template: "customer-service",
  conversation_config: {
    agent: {
      first_message:
        "Hey, welcome to BRGR! What can I get started for you today? You can also talk to me in Arabic - أهلاً، إيه اللي تحب تطلبه النهارده؟",
      language: "auto",
      prompt: {
        prompt: systemPrompt,
        llm: "claude-sonnet-4-6",
        temperature: 0.5,
        tools: [...webhookTools.map(webhookForAgent), ...clientTools],
      },
    },
    tts: {
      model_id: "eleven_turbo_v2_5",
      voice_id: "{{VOICE_ID}}",
      stability: 0.4,
      similarity_boost: 0.75,
    },
    vad: {
      type: "server_vad",
      silence_duration_ms: 600,
    },
  },
  platform_settings: {
    auth: {
      enable_auth: false,
    },
    trust_context: "low",
  },
};

const agentsIndex = {
  agents: [
    {
      name: "BRGR Voice",
      config_path: "agent_configs/brgr-voice.json",
      agent_id: null,
    },
  ],
};

await mkdir(path.join(agentDir, "agent_configs"), { recursive: true });
await mkdir(path.join(agentDir, "tool_configs"), { recursive: true });

await writeFile(path.join(agentDir, "agents.json"), `${JSON.stringify(agentsIndex, null, 2)}\n`);
await writeFile(path.join(agentDir, "agent_configs", "brgr-voice.json"), `${JSON.stringify(agentConfig, null, 2)}\n`);

const toolFiles = new Map([
  ["add-to-cart.json", addToCartFlat],
  ["view-cart.json", viewCartFlat],
  ["remove-from-cart.json", removeFromCartFlat],
  ["submit-order.json", submitOrderFlat],
]);

for (const [filename, config] of toolFiles) {
  await writeFile(path.join(agentDir, "tool_configs", filename), `${JSON.stringify(config, null, 2)}\n`);
}

console.log(`Generated BRGR agent config with ${categories.length} categories and ${webhookTools.length + clientTools.length} tools.`);
