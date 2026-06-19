import type { Config } from "tailwindcss";
import defaultColors from "tailwindcss/colors";

/**
 * The screening UI leans on a custom dark design system. Two mechanisms are
 * load-bearing and must not be "simplified":
 *   1. Colours are declared as `rgb(var(--x) / <alpha-value>)` so the slash
 *      opacity modifiers the page uses (e.g. `border-red/30`, `bg-amber/10`)
 *      resolve against CSS variables defined in globals.css.
 *   2. fontSize keys are bare numeric strings — Tailwind prefixes `text-` and
 *      escapes the dot, yielding `text-10`, `text-10.5`, `text-11`, `text-12`.
 *
 * Default Tailwind colour scales (red-950, emerald-300, …) are spread back in
 * because the page also uses a handful of stock shades.
 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 0: v("--ink-0"), 1: v("--ink-1"), 2: v("--ink-2"), 3: v("--ink-3") },
        bg: {
          DEFAULT: v("--bg"),
          1: v("--bg-1"),
          2: v("--bg-2"),
          panel: v("--bg-panel"),
        },
        brand: { DEFAULT: v("--brand"), dim: v("--brand-dim"), line: v("--brand-line") },
        hair: { DEFAULT: v("--hair"), 2: v("--hair-2") },
        red: { ...defaultColors.red, DEFAULT: v("--red"), dim: v("--red-dim") },
        amber: { ...defaultColors.amber, DEFAULT: v("--amber"), dim: v("--amber-dim") },
        green: { ...defaultColors.green, DEFAULT: v("--green"), dim: v("--green-dim") },
        orange: { ...defaultColors.orange, DEFAULT: v("--orange") },
        violet: { ...defaultColors.violet, DEFAULT: v("--violet") },
        accent: v("--accent"),
        fg: { muted: v("--fg-muted") },
      },
      fontSize: {
        "10": ["10px", { lineHeight: "14px" }],
        "10.5": ["10.5px", { lineHeight: "15px" }],
        "11": ["11px", { lineHeight: "15px" }],
        "12": ["12px", { lineHeight: "16px" }],
      },
      letterSpacing: {
        "wide-3": "0.03em",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
