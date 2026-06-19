/**
 * Chip palette for locations, staff, and (later) calendar chips. Color classes are LITERAL
 * (light+dark variants) so Tailwind v4 generates them from this scanned source. Human labels are
 * i18n keys — never hardcode copy here.
 *
 * `CHIP_COLORS` (10) is the location picker palette; `STAFF_COLORS` is the larger palette each
 * staff member picks a UNIQUE color from. `chipClass`/`chipSwatch` resolve any key from either set.
 */
export interface ChipColor {
  key: string
  /** Solid swatch for the picker dot. */
  swatch: string
  /** Subtle bg+text for the rendered chip/badge. */
  chip: string
}

const COLORS: ChipColor[] = [
  // First 10 — the location palette.
  { key: 'teal', swatch: 'bg-teal-500', chip: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
  { key: 'blue', swatch: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { key: 'emerald', swatch: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  { key: 'amber', swatch: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { key: 'orange', swatch: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  { key: 'rose', swatch: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  { key: 'violet', swatch: 'bg-violet-500', chip: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  { key: 'pink', swatch: 'bg-pink-500', chip: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  { key: 'cyan', swatch: 'bg-cyan-500', chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
  { key: 'slate', swatch: 'bg-slate-500', chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  // + 8 more for the larger staff palette (sizable, so a team rarely runs out of unique colors).
  { key: 'indigo', swatch: 'bg-indigo-500', chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  { key: 'sky', swatch: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  { key: 'lime', swatch: 'bg-lime-500', chip: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300' },
  { key: 'fuchsia', swatch: 'bg-fuchsia-500', chip: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300' },
  { key: 'red', swatch: 'bg-red-500', chip: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  { key: 'green', swatch: 'bg-green-500', chip: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  { key: 'yellow', swatch: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
  { key: 'stone', swatch: 'bg-stone-500', chip: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300' }
]

/** Location picker palette (10). */
export const CHIP_COLORS: ChipColor[] = COLORS.slice(0, 10)
/** Staff picker palette (full set — each member picks a unique one). */
export const STAFF_COLORS: ChipColor[] = COLORS

const COLOR_MAP = new Map(COLORS.map(c => [c.key, c]))
const FALLBACK_CHIP = 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'

/**
 * Outlined variant (border + text, no fill) — used for main service-category chips (28-service-categories.md).
 * Literal classes so Tailwind v4 generates them; keyed by the same color names as COLORS.
 */
const OUTLINE: Record<string, string> = {
  teal: 'border border-teal-300 text-teal-700 dark:border-teal-800 dark:text-teal-300',
  blue: 'border border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300',
  emerald: 'border border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
  amber: 'border border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
  orange: 'border border-orange-300 text-orange-700 dark:border-orange-800 dark:text-orange-300',
  rose: 'border border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300',
  violet: 'border border-violet-300 text-violet-700 dark:border-violet-800 dark:text-violet-300',
  pink: 'border border-pink-300 text-pink-700 dark:border-pink-800 dark:text-pink-300',
  cyan: 'border border-cyan-300 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300',
  slate: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  indigo: 'border border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300',
  sky: 'border border-sky-300 text-sky-700 dark:border-sky-800 dark:text-sky-300',
  lime: 'border border-lime-300 text-lime-700 dark:border-lime-800 dark:text-lime-300',
  fuchsia: 'border border-fuchsia-300 text-fuchsia-700 dark:border-fuchsia-800 dark:text-fuchsia-300',
  red: 'border border-red-300 text-red-700 dark:border-red-800 dark:text-red-300',
  green: 'border border-green-300 text-green-700 dark:border-green-800 dark:text-green-300',
  yellow: 'border border-yellow-300 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300',
  stone: 'border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300'
}
const FALLBACK_OUTLINE = 'border border-default text-muted'

export interface ChipIcon {
  id: string
  name: string
}

export const CHIP_ICONS: ChipIcon[] = [
  { id: 'pin', name: 'i-lucide-map-pin' },
  { id: 'home', name: 'i-lucide-home' },
  { id: 'trees', name: 'i-lucide-trees' },
  { id: 'paw', name: 'i-lucide-paw-print' },
  { id: 'scissors', name: 'i-lucide-scissors' },
  { id: 'cap', name: 'i-lucide-graduation-cap' },
  { id: 'vet', name: 'i-lucide-stethoscope' },
  { id: 'camera', name: 'i-lucide-camera' },
  { id: 'dumbbell', name: 'i-lucide-dumbbell' },
  { id: 'car', name: 'i-lucide-car' }
]

export const DEFAULT_CHIP_COLOR = 'teal'

/** Default icon by location kind. */
export function defaultChipIcon(kind: string): string {
  return kind === 'area' ? 'i-lucide-trees' : 'i-lucide-map-pin'
}

/** Subtle chip classes for a color key (falls back to teal). */
export function chipClass(colorKey: string): string {
  return COLOR_MAP.get(colorKey)?.chip ?? FALLBACK_CHIP
}

/** Outlined chip classes for a color key (border + text, no fill; neutral fallback). */
export function chipOutlineClass(colorKey: string): string {
  return OUTLINE[colorKey] ?? FALLBACK_OUTLINE
}

/** Solid swatch class for a color key (for the picker trigger / dots). */
export function chipSwatch(colorKey: string): string {
  return COLOR_MAP.get(colorKey)?.swatch ?? 'bg-teal-500'
}

/** The icon id (i18n-label key) for an icon name, or '' if not in the set. */
export function chipIconId(name: string): string {
  return CHIP_ICONS.find(i => i.name === name)?.id ?? ''
}
