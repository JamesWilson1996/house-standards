// Tests for the shipped CSS: it loads nothing from another origin, and fonts.css points at files that ship.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (name) => readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
const OTHER_ORIGIN = /(?:@import|url\()\s*["']?\s*(?:https?:)?\/\//i;

test("bundle.css, tokens.css and fonts.css load nothing from another origin (#112)", () => {
  for (const file of ["bundle.css", "tokens.css", "fonts.css"]) {
    assert.doesNotMatch(read(file), OTHER_ORIGIN, file);
  }
});

test("every font file fonts.css names ships beside it", () => {
  const urls = [...read("fonts.css").matchAll(/url\("\.\/([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(urls.length > 0);
  for (const path of urls) assert.ok(existsSync(new URL(`./${path}`, import.meta.url)), path);
});

test("the variable fonts cover every weight the type scale uses", () => {
  const tokens = JSON.parse(read("tokens.json"));
  const weights = tokens.type.groups.flatMap((g) => g.styles.map((s) => Number(s.fontWeight)));
  const ranges = [...read("fonts.css").matchAll(/font-family: Figtree;[\s\S]*?font-weight: (\d+) (\d+);/g)].map((m) => [Number(m[1]), Number(m[2])]);
  assert.ok(ranges.length > 0);
  for (const w of weights) assert.ok(ranges.every(([lo, hi]) => w >= lo && w <= hi), `weight ${w}`);
});

test("before data-theme is set, tokens.css and bundle.css follow the OS, so the launch draws in the right theme (#146)", () => {
  assert.match(read("tokens.css"), /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme\]\) \{\s*--bg: var\(--mist-950\);/);
  assert.match(read("bundle.css"), /@media \(prefers-color-scheme: dark\) \{ :root:not\(\[data-theme\]\) \{ color-scheme: dark; \} \}/);
});

test("the launch shows only in an installed app and keeps its mark in forced colours (#146)", () => {
  const bundle = read("bundle.css");
  assert.match(bundle, /\.ls-launch \{[^}]*display: none;/);
  assert.match(bundle, /@media \(display-mode: standalone\)[^{]*\{ \.ls-launch \{ display: grid; \} \}/);
  // After the launch's own fills, which have the same specificity.
  const fills = bundle.indexOf(".ls-launch__mark .ls-mark-sage { fill");
  const forced = bundle.indexOf(".ls-launch__mark :is(.ls-mark-lilac, .ls-mark-sage) { fill: CanvasText; }");
  assert.ok(fills > 0 && forced > fills);
  // Each leaf grows over motion-launch; sage starts halfway through lilac.
  assert.match(bundle, /\.ls-launch__mark path \{[^}]*animation: ls-launch-leaf var\(--motion-launch\)/);
  assert.match(bundle, /\.ls-launch__mark \.ls-mark-sage \{ animation-delay: calc\(var\(--motion-launch\) \/ 2\); \}/);
});
