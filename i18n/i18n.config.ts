// vue-i18n runtime config (Composition API). Messages themselves are loaded per-locale
// from i18n/locales/<locale>/*.json via the @nuxtjs/i18n `files` config (see nuxt.config.ts).
export default defineI18nConfig(() => ({
  legacy: false,
  // Only `pl` is populated for now; en/bg fall back to pl until translated.
  fallbackLocale: 'pl'
}))
