import { readFile, writeFile } from "node:fs/promises";

const backendUrl = "https://brgr-tools.vercel.app";
const voiceId = "JHdGl5PsEzushIzzVSd1";

const descriptions = {
  conversation_id: "The ElevenLabs conversation ID for this call.",
  menu_item_id: "The numeric BRGR menu item ID from the system prompt.",
  quantity: "How many of this item to add. Use 1 if unspecified.",
  modifiers: "Optional item modifications such as bun choice or add-ons.",
  bun: "Optional bun choice.",
  add_ons: "Optional array of add-on item IDs from the add-ons list.",
  notes: "Optional kitchen notes.",
  line_id: "The cart line ID returned by view_cart.",
  customer_name: "The customer name for the order.",
  phone: "Egyptian phone number, 11 digits starting with 010, 011, 012, or 015.",
  address: "The delivery address.",
  payment_method: "Payment method for the order.",
  category_name: "The exact menu category name to show.",
  item_ids: "Array of BRGR menu item IDs to highlight.",
  item_id: "BRGR menu item ID to show in detail.",
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

agentConfig.conversation_config.agent.language = "ar";
agentConfig.conversation_config.tts.voice_id = voiceId;
delete agentConfig.conversation_config.agent.prompt.built_in_tools;

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
