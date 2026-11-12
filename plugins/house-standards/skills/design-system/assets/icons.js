// Lilac & Sage mark and app icons (brand book Iconography; components.md, The head and Brand).
// The mark is two leaves, lilac and sage, from one stem. Apps draw it inline with the mark-lilac and mark-sage tokens; this module
// writes the standalone SVG files that can't read CSS: the favicon, the home-screen icons and the maskable icon.
// Pure strings, no DOM, so a build script can write them. A test keeps BRAND_COLOURS equal to tokens.json.

/** The mark's drawing box. */
export const MARK_VIEWBOX = "0 0 32 32";
/** The two leaves, in MARK_VIEWBOX. The lilac leaf is on the left, the sage leaf on the right and taller. */
export const MARK_LEAVES = {
  lilac: "M15.5 27C9 25.5 4.5 19.5 5 8.5c7 .5 12 6.5 10.5 18.5z",
  sage: "M16.5 27c-1.5-12 3.5-18 11-21 1 11.5-4 19.5-11 21z",
};

/** Resolved token values for files that can't read tokens.css: mark-lilac, mark-sage, accent-soft (the tile) and on-accent-soft (a glyph). */
export const BRAND_COLOURS = {
  light: { lilac: "#6f4fb8", sage: "#3b875d", tile: "#eee8fb", glyph: "#563d92" },
  dark: { lilac: "#c6b4ee", sage: "#9fd8b7", tile: "#2e2645", glyph: "#ddd2f6" },
};

/** The files every app ships, with their size in px. "any" icons have rounded corners; the others fill their square. */
export const APP_ICONS = {
  "favicon.svg": { size: 32, shape: "rounded", content: 0.75 },
  "apple-touch-icon.svg": { size: 180, shape: "square", content: 0.64 },
  "icon-192.svg": { size: 192, shape: "rounded", content: 0.7 },
  "icon-512.svg": { size: 512, shape: "rounded", content: 0.7 },
  // Android crops a maskable icon to its own shape; only the middle 80% circle is safe, and a square in it is about 56% wide.
  "icon-maskable-512.svg": { size: 512, shape: "square", content: 0.52 },
};

const GLYPH_BOX = 24; // Lucide's viewBox
const MARK_BOX = 32;
const CORNER_RATIO = 0.22; // a rounded tile's corner radius, as a share of its side
const GLYPH_STROKE = 2;

const leaves = (theme) =>
  `<path class="ls-mark-lilac" fill="${BRAND_COLOURS[theme].lilac}" d="${MARK_LEAVES.lilac}"/><path class="ls-mark-sage" fill="${BRAND_COLOURS[theme].sage}" d="${MARK_LEAVES.sage}"/>`;

/** The mark on its own, for a file (a README, a slide). In an app, draw MARK_LEAVES inline with var(--mark-lilac) and var(--mark-sage). */
export function markSvg({ theme = "light", size = MARK_BOX } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${MARK_VIEWBOX}" role="img" aria-label="Lilac &amp; Sage">${leaves(theme)}</svg>`;
}

/**
 * One app's icon set: { "favicon.svg": "<svg…>", … }, keyed by the file names in APP_ICONS.
 * Each is the mark on an accent-soft tile, or with `glyph` (a Lucide icon's inner markup, such as '<path d="…"/>') that icon drawn
 * in on-accent-soft instead, for an app that needs its own icon beside other house apps on one home screen.
 * The favicon follows the OS theme; the home-screen icons use the light theme, as the manifest does. Render each to a PNG of its size.
 */
export function appIcons({ glyph } = {}) {
  const files = {};
  for (const [file, { size, shape, content }] of Object.entries(APP_ICONS)) {
    const box = glyph ? GLYPH_BOX : MARK_BOX;
    const scale = (size * content) / box;
    const offset = (size - size * content) / 2;
    const radius = shape === "rounded" ? size * CORNER_RATIO : 0;
    const light = BRAND_COLOURS.light;
    const art = glyph
      ? `<g class="ls-icon-glyph" fill="none" stroke="${light.glyph}" stroke-width="${GLYPH_STROKE}" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>`
      : leaves("light");
    // Only the favicon sits in a browser tab that may be dark; installed icons are drawn once, in the light theme.
    const dark =
      file === "favicon.svg"
        ? `<style>@media (prefers-color-scheme: dark){.ls-icon-tile{fill:${BRAND_COLOURS.dark.tile}}.ls-mark-lilac{fill:${BRAND_COLOURS.dark.lilac}}.ls-mark-sage{fill:${BRAND_COLOURS.dark.sage}}.ls-icon-glyph{stroke:${BRAND_COLOURS.dark.glyph}}}</style>`
        : "";
    files[file] =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${dark}` +
      `<rect class="ls-icon-tile" width="${size}" height="${size}" rx="${radius}" fill="${light.tile}"/>` +
      `<g transform="translate(${offset} ${offset}) scale(${scale})">${art}</g></svg>`;
  }
  return files;
}
