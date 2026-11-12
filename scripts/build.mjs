// Generates every derived file from the single source in plugins/house-standards.
// CI runs this and fails on any diff, so derived copies can never drift.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const motionTokens = tokens.motion?.tokens ?? [];
const staticFamilies = [...tokens.spacing.tokens, ...tokens.radius.tokens, ...(tokens.size?.tokens ?? []), ...motionTokens];
// Durations people can switch off: the OS reduced-motion setting replaces them with their reducedMotion value.
const reducedMotion = motionTokens.filter((t) => t.reducedMotion !== undefined);
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
  ...(reducedMotion.length
    ? [`@media (prefers-reduced-motion: reduce) {\n  :root {\n${reducedMotion.map((t) => `    --${t.name}: ${t.reducedMotion};`).join("\n")}\n  }\n}`]
    : []),
  typeClasses.join("\n"),
  "",
].join("\n\n");

// A lost closing brace nests every later rule inside the block above it, and browsers accept that silently.
const assertBalancedBraces = (file) => {
  const code = readFileSync(join(SOURCE_DIR, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\]|\\.)*"/g, '""');
  let depth = 0;
  for (const [index, char] of [...code].entries()) {
    depth += char === "{" ? 1 : char === "}" ? -1 : 0;
    if (depth < 0) throw new Error(`${file}: unmatched } at line ${code.slice(0, index).split("\n").length}`);
  }
  if (depth !== 0) throw new Error(`${file}: ${depth} unclosed { block(s)`);
};
assertBalancedBraces("bundle.css");

mkdirSync(PACKAGE_DIR, { recursive: true });
writeFileSync(join(SOURCE_DIR, "tokens.css"), css);
writeFileSync(join(PACKAGE_DIR, "tokens.css"), css);
// The motion, day, combobox and icon helpers ship as-is; their tests stay beside the source.
for (const file of ["tokens.json", "bundle.css", "motion.js", "motion.d.ts", "days.js", "days.d.ts", "combobox.js", "combobox.d.ts", "icons.js", "icons.d.ts"]) {
  writeFileSync(join(PACKAGE_DIR, file), readFileSync(join(SOURCE_DIR, file)));
}
// The mark as files, for READMEs and anything that can't draw it inline (brand book Iconography).
const { markSvg } = await import(pathToFileURL(join(SOURCE_DIR, "icons.js")).href);
const LOGOS_DIR = join(SOURCE_DIR, "Logos");
mkdirSync(LOGOS_DIR, { recursive: true });
writeFileSync(join(LOGOS_DIR, "mark.svg"), `${markSvg()}
`);
writeFileSync(join(LOGOS_DIR, "mark-dark.svg"), `${markSvg({ theme: "dark" })}
`);
// The default icon set, rendered by scripts/render-icons.mjs, ships as icons/ so an app that uses the mark copies it.
const ICONS_DIR = join(LOGOS_DIR, "icons");
mkdirSync(join(PACKAGE_DIR, "icons"), { recursive: true });
for (const file of readdirSync(ICONS_DIR).filter((f) => f !== "rendered.json")) {
  writeFileSync(join(PACKAGE_DIR, "icons", file), readFileSync(join(ICONS_DIR, file)));
}
console.log(`built tokens.css (${themedFamilies.length} themed, ${staticFamilies.length} static tokens), the mark, and synced packages/ui-tokens (with motion.js, days.js, combobox.js and icons.js)`);
