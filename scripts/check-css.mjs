// Parses the shipped CSS with PostCSS, the parser Vite builds consuming apps with.
// Browsers skip stray text silently, so a broken comment only shows up when an app's build fails (#103).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "../packages/ui-tokens");
const SHIPPED_CSS = ["tokens.css", "bundle.css"];

let failed = false;
for (const file of SHIPPED_CSS) {
  const path = join(PACKAGE_DIR, file);
  try {
    postcss.parse(readFileSync(path, "utf8"), { from: path });
  } catch (error) {
    failed = true;
    console.error(`packages/ui-tokens/${file}:${error.line}:${error.column}: ${error.reason ?? error.message}`);
  }
}
process.exit(failed ? 1 : 0);
