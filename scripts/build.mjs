// Generates every derived file from the single source in plugins/house-standards.
// CI runs this and fails on any diff, so derived copies can never drift.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "plugins/house-standards/skills/design-system/assets");
const PACKAGE_DIR = join(ROOT, "packages/ui-tokens");
const GENERATED_HEADER = "/* Lilac & Sage — generated from tokens.json by scripts/build.mjs. Do not edit. */\n";

const tokens = JSON.parse(readFileSync(join(SOURCE_DIR, "tokens.json"), "utf8"));
const [primaryTheme, ...otherThemes] = tokens.color.themes.map((theme) => theme.id);

const resolve = (value, theme) => {
  const raw = typeof value === "string" ? value : value[theme] ?? value[primaryTheme];
  return raw.startsWith("{") ? `var(--${raw.slice(1, -1)})` : raw;
};
const isThemed = (token) => typeof token.value !== "string";
const declare = (list, theme) => list.map((t) => `  --${t.name}: ${resolve(t.value, theme)};`).join("\n");

const themedFamilies = [...tokens.color.tokens, ...(tokens.shadow?.tokens ?? [])];
const staticFamilies = [...tokens.spacing.tokens, ...tokens.radius.tokens, ...(tokens.size?.tokens ?? [])];
const fontVars = Object.entries(tokens.type.families).map(([key, stack]) => `  --font-${key}: ${stack};`);
const typeClasses = tokens.type.groups.flatMap((group) =>
  group.styles.map((style) => {
    const family = style.family ?? group.family;
    const props = [
      `font-family: var(--font-${family})`,
      `font-size: ${style.fontSize}`,
      `line-height: ${style.lineHeight}`,
      `font-weight: ${style.fontWeight}`,
      style.letterSpacing && `letter-spacing: ${style.letterSpacing}`,
    ].filter(Boolean);
    return `.${style.name} { ${props.join("; ")}; }`;
  }),
);

const css = [
  GENERATED_HEADER,
  `:root, [data-theme="${primaryTheme}"] {\n${declare(themedFamilies, primaryTheme)}\n}`,
  ...otherThemes.map((theme) => `[data-theme="${theme}"] {\n${declare(themedFamilies.filter(isThemed), theme)}\n}`),
  `:root {\n${declare(staticFamilies, primaryTheme)}\n${fontVars.join("\n")}\n}`,
  typeClasses.join("\n"),
  "",
].join("\n\n");

mkdirSync(PACKAGE_DIR, { recursive: true });
writeFileSync(join(SOURCE_DIR, "tokens.css"), css);
writeFileSync(join(PACKAGE_DIR, "tokens.css"), css);
for (const file of ["tokens.json", "bundle.css"]) {
  writeFileSync(join(PACKAGE_DIR, file), readFileSync(join(SOURCE_DIR, file)));
}
console.log(`built tokens.css (${themedFamilies.length} themed, ${staticFamilies.length} static tokens) and synced packages/ui-tokens`);
