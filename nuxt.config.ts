// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@formkit/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@pinia/nuxt',
    '@scalar/nuxt',
    'nuxt-qrcode',
    'nuxt-vuefire'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:9000',
    name: 'DogLife'
  },

  routeRules: {
    '/': { prerender: true }
  },

  // LOCAL dev server runs on :9000 (override with --port if needed).
  devServer: {
    port: 9000
  },

  compatibilityDate: '2025-01-15',

  // OpenAPI-first (see dev-docs/04-api-design.md). Nitro generates the spec from each route's
  // `defineRouteMeta({ openAPI: ... })`; @scalar/nuxt renders it. Docs UI at /_scalar, raw spec
  // at /_openapi.json.
  nitro: {
    experimental: {
      openAPI: true
    },
    openAPI: {
      meta: {
        title: 'DogLife API',
        description: 'Server routes for the DogLife marketplace (server-authoritative; all Firestore access via Admin SDK).',
        version: '0.1.0'
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // Launch locales (notifications/UI): pl (primary market), en, bg. Using `no_prefix`
  // for now to avoid routing churn before translations exist; switch to a prefixed
  // strategy for localized SEO once locale content lands.
  //
  // Message catalog: one JSON file per namespace under i18n/locales/<locale>/ (file name ==
  // top-level key). See dev-docs/00-conventions.md#i18n. Only `pl` is populated for now;
  // en/bg fall back to pl (i18n.config.ts) until translated.
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'pl',
    // Only `pl` is translated, so DON'T auto-pick the browser language (an English browser would
    // otherwise boot the empty `en` catalog and show raw keys, persisted in `i18n_redirected`).
    // Always start in `pl`; the user switches explicitly via /app-settings/language.
    detectBrowserLanguage: false,
    vueI18n: 'i18n.config.ts',
    langDir: 'locales',
    locales: [
      {
        code: 'pl',
        language: 'pl-PL',
        name: 'Polski',
        files: [
          'pl/common.json',
          'pl/validation.json',
          'pl/errors.json',
          'pl/nav.json',
          'pl/auth.json',
          'pl/account.json',
          'pl/appSettings.json',
          'pl/provider.json',
          'pl/handling.json',
          'pl/geo.json',
          'pl/onboarding.json',
          'pl/home.json',
          'pl/opiekun.json'
        ]
      },
      // en/bg not translated yet — empty catalogs; they fall back to pl (i18n.config.ts).
      { code: 'en', language: 'en-US', name: 'English', files: ['en/_placeholder.json'] },
      { code: 'bg', language: 'bg-BG', name: 'Български', files: ['bg/_placeholder.json'] }
    ]
  },

  // No dynamic OG image generation yet — static og:image (from useSeoMeta) still works.
  // Avoids the runtime renderer + signing-secret requirement; revisit if we want
  // per-page generated social cards.
  ogImage: {
    zeroRuntime: true
  },

  // Firebase via nuxt-vuefire. Config comes from env (see .env / .env.example).
  // LOCAL uses a demo project + the Firebase Emulator Suite (auto-detected via the
  // emulator hub when `firebase emulators:start` is running). See dev-docs/10 & 03.
  vuefire: {
    config: {
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
    },
    // SSR auth (session cookies) uses the Admin SDK, which nuxt-vuefire initializes once it
    // detects the running Emulator Suite (via the emulator hub) or a service account. LOCAL
    // relies on `firebase emulators:start` being up (Auth/Firestore/Storage). See dev-docs/10.
    auth: { enabled: true },
    // `disableWarnings` silences the client Auth-emulator banner/console warning
    // ("Running in emulator mode…") — it's expected on LOCAL. Passed straight to
    // firebase/auth's connectAuthEmulator(). The terminal-side Auth emulator warning is separate.
    emulators: {
      enabled: true,
      auth: { options: { disableWarnings: true } }
    }
  }
})
