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
