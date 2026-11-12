// Tests for icons.js: the mark's colours match the tokens, and every app icon has its size, shape and safe zone.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APP_ICONS, BRAND_COLOURS, MARK_LEAVES, appIcons, markSvg } from "./icons.js";

const tokens = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
const byName = Object.fromEntries([...tokens.color.primitives ?? [], ...tokens.color.tokens].map((t) => [t.name, t.value]));
const resolve = (name, theme) => {
  let value = byName[name];
  for (;;) {
    const raw = typeof value === "string" ? value : value[theme];
    if (!raw.startsWith("{")) return raw;
    value = byName[raw.slice(1, -1)];
  }
};
const TOKEN_FOR = { lilac: "mark-lilac", sage: "mark-sage", tile: "accent-soft", glyph: "on-accent-soft" };
const HOUSE = '<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>';

test("BRAND_COLOURS are the tokens' values in both themes", () => {
  for (const theme of ["light", "dark"]) {
    for (const [key, token] of Object.entries(TOKEN_FOR)) assert.equal(BRAND_COLOURS[theme][key], resolve(token, theme), `${theme} ${key}`);
  }
});

test("markSvg draws both leaves in the theme's colours", () => {
  const light = markSvg();
  assert.match(light, new RegExp(`fill="${BRAND_COLOURS.light.lilac}" d="${MARK_LEAVES.lilac}"`));
  assert.match(light, new RegExp(`fill="${BRAND_COLOURS.light.sage}"`));
  assert.match(markSvg({ theme: "dark", size: 96 }), /width="96".*fill="#c6b4ee"/);
});

test("appIcons writes every file at its size", () => {
  const files = appIcons();
  assert.deepEqual(Object.keys(files), Object.keys(APP_ICONS));
  for (const [file, { size }] of Object.entries(APP_ICONS)) {
    assert.match(files[file], new RegExp(`^<svg [^>]*width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`), file);
  }
});

test("the favicon follows a dark OS theme; installed icons stay light", () => {
  const files = appIcons();
  assert.match(files["favicon.svg"], /prefers-color-scheme: dark/);
  assert.doesNotMatch(files["icon-512.svg"], /prefers-color-scheme/);
});

test("full-bleed icons fill their square and rounded ones round their corners", () => {
  const files = appIcons();
  assert.match(files["icon-maskable-512.svg"], /rx="0"/);
  assert.match(files["apple-touch-icon.svg"], /rx="0"/);
  assert.doesNotMatch(files["icon-192.svg"], /rx="0"/);
});

test("the maskable icon's art fits inside Android's 80% safe circle", () => {
  const { size, content } = APP_ICONS["icon-maskable-512.svg"];
  // The art's square, corner to corner, must sit within the circle.
  const halfDiagonal = (size * content * Math.SQRT2) / 2;
  assert.ok(halfDiagonal <= (size * 0.8) / 2, `${halfDiagonal} > ${(size * 0.8) / 2}`);
});

test("a glyph replaces the mark, drawn as a Lucide stroke", () => {
  const icon = appIcons({ glyph: HOUSE })["icon-192.svg"];
  assert.ok(icon.includes(HOUSE));
  assert.match(icon, /stroke-width="2"/);
  assert.doesNotMatch(icon, new RegExp(MARK_LEAVES.lilac.slice(0, 12)));
});
