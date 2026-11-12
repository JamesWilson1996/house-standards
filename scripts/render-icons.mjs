// Renders the default app icons (the mark, from icons.js) to PNGs, so an app that uses the mark copies them and needs no rasteriser.
// Run after changing icons.js or the mark's tokens: npm install, then npm run render-icons, then node scripts/build.mjs.
// icons.test.mjs fails while a PNG is older than its SVG, using the hashes this writes to rendered.json.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "plugins/house-standards/skills/design-system/assets");
const OUT_DIR = join(SOURCE_DIR, "Logos/icons");
const { appIcons, APP_ICONS } = await import(pathToFileURL(join(SOURCE_DIR, "icons.js")).href);

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

mkdirSync(OUT_DIR, { recursive: true });
const rendered = {};
for (const [file, svg] of Object.entries(appIcons())) {
  rendered[file] = sha256(svg);
  // The favicon stays SVG, so it can follow a dark OS theme.
  if (file === "favicon.svg") {
    writeFileSync(join(OUT_DIR, file), `${svg}\n`);
    continue;
  }
  const png = new Resvg(svg, { fitTo: { mode: "width", value: APP_ICONS[file].size } }).render().asPng();
  writeFileSync(join(OUT_DIR, file.replace(/\.svg$/, ".png")), png);
}
writeFileSync(join(OUT_DIR, "rendered.json"), `${JSON.stringify(rendered, null, 2)}\n`);
console.log(`rendered ${Object.keys(rendered).length} icons into ${OUT_DIR}`);
