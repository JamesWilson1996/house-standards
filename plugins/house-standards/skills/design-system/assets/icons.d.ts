// Types for icons.js, the Lilac & Sage mark and app icons (brand book Iconography; components.md, Brand).

export type Theme = "light" | "dark";

/** The mark's drawing box, "0 0 32 32". */
export declare const MARK_VIEWBOX: string;

/** The two leaves' path data, in MARK_VIEWBOX. */
export declare const MARK_LEAVES: { lilac: string; sage: string };

/** Resolved token values for standalone files: mark-lilac, mark-sage, accent-soft (tile) and on-accent-soft (glyph). */
export declare const BRAND_COLOURS: Record<Theme, { lilac: string; sage: string; tile: string; glyph: string }>;

export type AppIconFile = "favicon.svg" | "apple-touch-icon.svg" | "icon-192.svg" | "icon-512.svg" | "icon-maskable-512.svg";

/** Each icon's size in px, its shape and the share of its side the art takes. */
export declare const APP_ICONS: Record<AppIconFile, { size: number; shape: "rounded" | "square"; content: number }>;

/** The mark on its own as an SVG file. In an app, draw MARK_LEAVES inline with var(--mark-lilac) and var(--mark-sage) instead. */
export declare function markSvg(options?: { theme?: Theme; size?: number }): string;

/** One app's icon set, keyed by file name: the mark, or a Lucide glyph's inner markup, on an accent-soft tile. */
export declare function appIcons(options?: { glyph?: string }): Record<AppIconFile, string>;
