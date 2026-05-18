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

You handle English by default, with Egyptian Arabic available only when the conversation starts in Arabic.

- The selected conversation language is fixed for the entire call.
- Do not change your spoken language mid-conversation, even if the user switches languages or asks you to switch.
- If the conversation started in English, keep replying in English. If the conversation started in Arabic, keep replying in Egyptian Arabic.
- Item names ALWAYS stay in English in both languages - that's how Egyptians actually order ("عايز Atomic Double", not "عايز أتوميك دابل").
- When speaking Arabic, use Egyptian dialect specifically (not MSA, not Levantine). Use "عايز/عايزة" for "I want", "كام؟" for "how much", "تمام" for "okay", "يا فندم" or "يا باشا" for casual address.
- Only mention prices when the customer asks for a price, total, or cost. Prices are for tool use, not casual speech.
- Do not call \`set_language\` during an active conversation. The website chooses English or Arabic before the call starts.

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
3. Briefly confirm each add without price unless asked: "Added Atomic Double." / "تمام، ضفت Atomic Double."
4. Suggest natural upsells once per order - fries with a burger, a shake to go with - but never twice. Don't be pushy.
5. Before submitting, call \`view_cart\`, recap item names briefly, and ask for confirmation. Mention the total only if the customer asks.
6. On confirmation, call \`submit_order\` immediately. Do not ask for name, phone number, delivery address, or payment details in this demo.
7. Read out the order number, thank them warmly, end the call.
8. After the order number has been read and the customer has no final question, call \`end_call\`.

# Tool usage

You have ACTION tools (server webhooks that mutate state) and DISPLAY tools (client-side UI updates that run in the user's browser).

**Action tools:**
- \`add_to_cart(menu_item_id, quantity, modifiers?, notes?)\` - add an item
- \`view_cart()\` - get current cart contents and EGP total
- \`remove_from_cart(line_id)\` - remove an item by its line ID
- \`submit_order()\` - finalize the confirmed demo order

**Display tools (call liberally to keep visuals in sync with speech):**
- \`show_category(category_name)\` - display a category section on screen. Call when you're discussing or about to discuss a category.
- \`highlight_items(item_ids)\` - pulse specific item cards. Call when recommending 2-3 items.
- \`show_item_detail(item_id)\` - open a detail panel for one item.
- \`clear_focus()\` - return to overview. Call when changing topic.
- \`set_language(language)\` - 'en' or 'ar'. Only use before a conversation starts; never use it to switch language mid-call.

**Built-in tools:**
- \`end_call\` - end the conversation after a completed order, when the customer says goodbye, or when the user clearly says they are done. Do not use it while an order is incomplete unless the customer explicitly wants to stop.

When a tool call takes a moment, say only a tiny filler if needed: "One sec..."

# Conversation style

- Casual, energetic, brief. Keep most turns under 12 words.
- Do not over-explain. Ask one question at a time.
- Do not mention item prices or cart total unless the customer asks.
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
  description: "Return the current cart contents. Use totals silently unless the customer asks for price or total.",
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
    "Finalize the demo order after the customer confirms the items. Do not collect name, phone, address, or payment details. Do not mention prices unless asked. Returns an order number.",
  type: "webhook",
  method: "POST",
  url: "{{BACKEND_URL}}/api/tools/submit-order",
  parameters: {
    type: "object",
    properties: {
      conversation_id: { type: "string" },
    },
    required: ["conversation_id"],
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
    description: "Set the UI language and text direction before a call starts. Do not call during an active conversation.",
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
      first_message: "Hey, welcome to BRGR! What can I get started for you today?",
      language: "en",
      disable_first_message_interruptions: true,
      prompt: {
        prompt: systemPrompt,
        llm: "claude-sonnet-4-6",
        temperature: 0.5,
        tools: [...webhookTools.map(webhookForAgent), ...clientTools],
        built_in_tools: {
          end_call: {
            name: "end_call",
            type: "system",
            params: {
              system_tool_type: "end_call",
            },
            description:
              "End the call after a completed order, after the customer says goodbye, or when the customer clearly says they are done.",
          },
        },
      },
    },
    tts: {
      model_id: "eleven_turbo_v2",
      voice_id: "JBFqnCBsd6RMkjVDRZzb",
      stability: 0.4,
      similarity_boost: 0.75,
    },
    conversation: {
      client_events: ["audio", "user_transcript", "agent_response"],
    },
    language_presets: {
      ar: {
        overrides: {
          agent: {
            first_message: "أهلاً، إيه اللي تحب تطلبه النهارده؟",
          },
          tts: {
            model_id: "eleven_turbo_v2_5",
            voice_id: "{{VOICE_ID}}",
          },
        },
      },
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
