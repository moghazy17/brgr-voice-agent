import { readFile, writeFile } from "node:fs/promises";

const backendUrl = "https://brgr-tools.vercel.app";
const englishVoiceId = "JBFqnCBsd6RMkjVDRZzb";
const arabicVoiceId = "JHdGl5PsEzushIzzVSd1";

const descriptions = {
  conversation_id: "The ElevenLabs conversation ID for this call.",
  conversationId: "The ElevenLabs conversation ID for this call.",
  menu_item_id: "The numeric BRGR menu item ID from the system prompt.",
  menuItemId: "The numeric BRGR menu item ID from the system prompt.",
  quantity: "How many of this item to add. Use 1 if unspecified.",
  modifiers: "Optional item modifications such as bun choice or add-ons.",
  bun: "Optional bun choice.",
  add_ons: "Optional array of add-on item IDs from the add-ons list.",
  addOns: "Optional array of add-on item IDs from the add-ons list.",
  notes: "Optional kitchen notes.",
  line_id: "The cart line ID returned by view_cart.",
  lineId: "The cart line ID returned by view_cart.",
  category_name: "The exact menu category name to show.",
  categoryName: "The exact menu category name to show.",
  item_ids: "Array of BRGR menu item IDs to highlight.",
  itemIds: "Array of BRGR menu item IDs to highlight.",
  item_id: "BRGR menu item ID to show in detail.",
  itemId: "BRGR menu item ID to show in detail.",
  language: "UI language code, en or ar.",
};

function addDescriptions(schema, key) {
  if (!schema || typeof schema !== "object") {
    return;
  }

  const hasToolMetadata =
    schema.description || schema.dynamic_variable || schema.is_system_provided || schema.constant_value;

  if (key && !hasToolMetadata) {
    schema.description = descriptions[key] ?? `Value for ${key}.`;
  }

  if (schema.type === "object" && !schema.description) {
    schema.description = key ? `Object for ${key}.` : "Object parameters.";
  }

  if (schema.type === "array" && schema.items) {
    if (!schema.description && key) {
      schema.description = descriptions[key] ?? `Array for ${key}.`;
    }

    addDescriptions(schema.items, key ? `${key}_item` : "item");

    if (
      !schema.items.description &&
      !schema.items.dynamic_variable &&
      !schema.items.is_system_provided &&
      !schema.items.constant_value
    ) {
      schema.items.description = key === "item_ids" || key === "add_ons" ? "A BRGR menu item ID." : "Array item.";
    }
  }

  if (schema.properties) {
    for (const [propertyKey, propertySchema] of Object.entries(schema.properties)) {
      addDescriptions(propertySchema, propertyKey);
    }
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

const agentPath = "agent/agent_configs/brgr-voice.json";
const agentConfig = await readJson(agentPath);

agentConfig.conversation_config.agent.language = "en";
agentConfig.conversation_config.agent.first_message = "Hey, welcome to BRGR! What can I get started for you today?";
agentConfig.conversation_config.agent.disable_first_message_interruptions = true;
agentConfig.conversation_config.tts.voice_id = englishVoiceId;
agentConfig.conversation_config.tts.model_id = "eleven_turbo_v2";
agentConfig.conversation_config.conversation = {
  ...(agentConfig.conversation_config.conversation ?? {}),
  client_events: ["audio", "user_transcript", "agent_response"],
};
agentConfig.conversation_config.language_presets = {
  ...(agentConfig.conversation_config.language_presets ?? {}),
  ar: {
    overrides: {
      agent: {
        first_message: "أهلاً، إيه اللي تحب تطلبه النهارده؟",
      },
      tts: {
        model_id: "eleven_turbo_v2_5",
        voice_id: arabicVoiceId,
      },
    },
  },
};
agentConfig.conversation_config.agent.prompt.built_in_tools = {
  end_call: {
    name: "end_call",
    type: "system",
    params: {
      system_tool_type: "end_call",
    },
    description:
      "End the call after a completed order, after the customer says goodbye, or when the customer clearly says they are done.",
  },
};

for (const tool of agentConfig.conversation_config.agent.prompt.tools) {
  if (tool.type === "webhook") {
    tool.api_schema.url = tool.api_schema.url.replace("{{BACKEND_URL}}", backendUrl);
    addDescriptions(tool.api_schema.request_body_schema);
  }

  if (tool.type === "client") {
    addDescriptions(tool.parameters);
  }
}

await writeJson(agentPath, agentConfig);

for (const filename of ["add-to-cart", "view-cart", "remove-from-cart", "submit-order"]) {
  const path = `agent/tool_configs/${filename}.json`;
  const toolConfig = await readJson(path);
  toolConfig.url = toolConfig.url.replace("{{BACKEND_URL}}", backendUrl);
  addDescriptions(toolConfig.parameters);
  await writeJson(path, toolConfig);
}

const agentsPath = "agent/agents.json";
const agentsConfig = await readJson(agentsPath);
agentsConfig.agents = agentsConfig.agents.map((agent) => ({
  id: agent.id || agent.agent_id || null,
  name: agent.name,
  config: agent.config || agent.config_path || "agent_configs/brgr-voice.json",
}));
await writeJson(agentsPath, agentsConfig);

console.log("Prepared BRGR Voice agent config for ElevenLabs push.");
