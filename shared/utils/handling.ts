/**
 * Global pet **handling** question catalogue (platform-defined). Providers do NOT author these —
 * per service they pick which keys are REQUIRED (`service.requiredPetQuestions`). Answers persist on
 * `pets.handling[key]` and are reused across bookings (stable per pet — the "90% the same" data).
 *
 * Provider-authored, per-booking questions are a SEPARATE concept (`service.customQuestions` →
 * answers stored on the booking — the "90% different" data). See dev-docs/19-pets.md.
 *
 * Plain TS (no Vue/Nitro deps): the app auto-imports it; the server imports it relatively
 * (`../../shared/utils/handling`) — mirrors `shared/utils/geo.ts`. Display labels & option text live
 * in i18n (`handling.json`, keyed by `handling.q.<key>` / `handling.scales.<scale>.<opt>`) — never
 * hardcode user-facing copy here.
 */

export type HandlingType = 'boolean' | 'choice' | 'text'
export type Species = 'dog' | 'cat'

export interface HandlingQuestion {
  /** Stable catalogue key, also the `pets.handling` map key. */
  key: string
  /** Group key for UI sectioning (i18n `handling.groups.<group>`). */
  group: string
  type: HandlingType
  /** For `choice` — id into {@link SCALES} + i18n `handling.scales.<scale>`. */
  scale?: string
  /** `boolean`/`choice` questions that invite an optional free-text follow-up when answered. */
  detail?: boolean
  /** Restrict to species (default: both). e.g. `in_heat` → dog only. */
  species?: Species[]
}

/** Option sets for `choice` questions. Per-scale namespaces avoid label collisions across scales. */
export const SCALES: Record<string, string[]> = {
  attitude: ['friendly', 'neutral', 'unsure', 'reactive', 'aggressive'],
  tolerance: ['calm', 'tolerates', 'with_difficulty', 'stressed', 'aggressive'],
  offleash: ['yes', 'conditional', 'no'],
  alone: ['yes', 'short', 'no']
}

/** The 23 platform handling questions, grouped for the service form. */
export const HANDLING_CATALOGUE: HandlingQuestion[] = [
  // Social behaviour
  { key: 'attitude_people', group: 'social', type: 'choice', scale: 'attitude' },
  { key: 'attitude_dogs', group: 'social', type: 'choice', scale: 'attitude' },
  { key: 'attitude_children', group: 'social', type: 'choice', scale: 'attitude' },
  // Safety
  { key: 'bite_history_human', group: 'safety', type: 'boolean', detail: true },
  { key: 'bite_history_dog', group: 'safety', type: 'boolean', detail: true },
  { key: 'resource_guarding', group: 'safety', type: 'boolean', detail: true },
  { key: 'muzzle', group: 'safety', type: 'boolean', detail: true },
  // Health
  { key: 'medication', group: 'health', type: 'boolean', detail: true },
  { key: 'allergies', group: 'health', type: 'boolean', detail: true },
  { key: 'health_limitations', group: 'health', type: 'boolean', detail: true },
  { key: 'fears', group: 'health', type: 'boolean', detail: true },
  { key: 'in_heat', group: 'health', type: 'boolean', species: ['dog'] },
  // Grooming / handling
  { key: 'grooming_vet_tolerance', group: 'care', type: 'choice', scale: 'tolerance', detail: true },
  { key: 'handling_rules', group: 'care', type: 'text' },
  // Independence / logistics
  { key: 'offleash', group: 'logistics', type: 'choice', scale: 'offleash', detail: true },
  { key: 'alone_ok', group: 'logistics', type: 'choice', scale: 'alone', detail: true },
  { key: 'car_travel', group: 'logistics', type: 'boolean', detail: true },
  // Experience / training
  { key: 'commands', group: 'training', type: 'boolean', detail: true },
  { key: 'group_experience', group: 'training', type: 'boolean' },
  { key: 'boarding_experience', group: 'training', type: 'boolean' },
  { key: 'rewards', group: 'training', type: 'text' },
  // Guidance for the provider
  { key: 'warnings', group: 'guidance', type: 'text' },
  { key: 'avoid', group: 'guidance', type: 'text' }
]

/** Group order for the service form sections (i18n `handling.groups.<group>`). */
export const HANDLING_GROUPS = ['social', 'safety', 'health', 'care', 'logistics', 'training', 'guidance']

const KEY_SET = new Set(HANDLING_CATALOGUE.map(q => q.key))

/** True when `key` is a known catalogue key (server validation of `requiredPetQuestions`). */
export function isHandlingKey(key: string): boolean {
  return KEY_SET.has(key)
}

export function handlingQuestion(key: string): HandlingQuestion | undefined {
  return HANDLING_CATALOGUE.find(q => q.key === key)
}

/** Option keys for a question (empty for non-choice). */
export function handlingOptions(q: HandlingQuestion): string[] {
  return q.scale ? (SCALES[q.scale] ?? []) : []
}

/**
 * Provider-authored custom-question answer formats (`service.customQuestions[].type`). Yes/No and
 * number were intentionally left out for MVP — providers use these four.
 */
export const CUSTOM_QUESTION_TYPES = ['short_text', 'long_text', 'single_choice', 'multi_choice'] as const
export type CustomQuestionType = typeof CUSTOM_QUESTION_TYPES[number]

export interface CustomQuestion {
  id: string
  /** Provider's own question text (stored verbatim — NOT an i18n key). */
  label: string
  type: CustomQuestionType
  /** Provider-authored options (verbatim) — only for `single_choice` / `multi_choice`. */
  options?: string[]
  required?: boolean
}

/** True for the choice-style custom types that carry `options`. */
export function isChoiceQuestion(type: string): boolean {
  return type === 'single_choice' || type === 'multi_choice'
}
