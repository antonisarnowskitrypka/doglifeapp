/**
 * Main service categories — mirrors the platform `serviceCategories` catalogue
 * (dev-docs/28-service-categories.md). Keys are stable; PL labels are local until the
 * localized catalogue is wired. Colour = Tailwind palette name (ui-docs/00-ui-basics.md).
 */
export interface ServiceCategory {
  key: string
  label: string
  icon: string
  color: string
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: 'trainer_behaviourist', label: 'Trener / behawiorysta', icon: 'i-lucide-graduation-cap', color: 'blue' },
  { key: 'sport_training', label: 'Sport / trening', icon: 'i-lucide-medal', color: 'orange' },
  { key: 'physiotherapy', label: 'Fizjoterapia', icon: 'i-lucide-activity', color: 'green' },
  { key: 'grooming', label: 'Grooming', icon: 'i-lucide-scissors', color: 'violet' },
  { key: 'dietitian', label: 'Dietetyk', icon: 'i-lucide-salad', color: 'amber' },
  { key: 'facility_rental', label: 'Wynajem obiektu', icon: 'i-lucide-warehouse', color: 'slate' },
  { key: 'petsitting', label: 'Opieka (petsitting)', icon: 'i-lucide-heart-handshake', color: 'pink' },
  { key: 'photography', label: 'Fotografia', icon: 'i-lucide-camera', color: 'cyan' }
]

export const CATEGORY_KEYS = SERVICE_CATEGORIES.map(c => c.key)

export const SPECIES = [
  { key: 'dog', label: 'Psy' },
  { key: 'cat', label: 'Koty' }
]

/** Spoken languages offered for staff profiles (ISO-ish codes). Extend as needed. */
export const LANGUAGES = [
  { value: 'pl', label: 'Polski' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'uk', label: 'Українська' },
  { value: 'ru', label: 'Русский' },
  { value: 'bg', label: 'Български' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'cs', label: 'Čeština' }
]

/**
 * Language code → ISO 3166-1 alpha-2 country code, for flag display. A language is not a
 * country, so several differ (English→GB, Ukrainian→UA, Czech→CZ). Used by LanguageFlags.vue.
 */
export const LANGUAGE_COUNTRY: Record<string, string> = {
  pl: 'pl',
  en: 'gb',
  de: 'de',
  uk: 'ua',
  ru: 'ru',
  bg: 'bg',
  es: 'es',
  fr: 'fr',
  it: 'it',
  cs: 'cz'
}

/** Human label for a language code (falls back to the code itself). */
export function languageLabel(code: string): string {
  return LANGUAGES.find(l => l.value === code)?.label ?? code
}
