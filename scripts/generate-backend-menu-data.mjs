import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const menuJson = await readFile(path.join(root, "brgr-menu.json"), "utf8");
const menu = JSON.parse(menuJson);
const output = `const menuData = ${JSON.stringify(menu, null, 2)} as const;\n\nexport default menuData;\n`;

await writeFile(path.join(root, "backend", "lib", "menu-data.ts"), output);
console.log("Generated backend/lib/menu-data.ts");
