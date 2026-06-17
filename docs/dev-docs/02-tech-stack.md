# Tech Stack

## Frontend

| Concern | Package |
|---|---|
| Framework | Nuxt 4, Vue 3, TypeScript |
| State management | `@pinia/nuxt` |
| UI components | `@nuxt/ui` (Tailwind CSS v4) |
| Forms | `@formkit/nuxt` |
| Internationalisation | `@nuxtjs/i18n` |
| SEO | `@nuxtjs/seo` |
| Images | `@nuxt/image` |
| QR codes | `nuxt-qrcode` |
| Accessibility | `@nuxt/a11y` |
| Performance hints | `@nuxt/hints` |

## Backend

| Concern | Service |
|---|---|
| Platform | Firebase |
| Authentication | Firebase Auth |
| Database | Firestore |
| Business logic | Nuxt Server Routes + Cloud Functions |
| Push notifications | Firebase Cloud Messaging |
| File storage | Firebase Storage |
| App security | Firebase App Check |
| Firebase/Nuxt bridge | `nuxt-vuefire` |

## Payments

| Concern | Service |
|---|---|
| Provider | Stripe |
| Marketplace model | Stripe Connect |
| Checkout | Stripe Checkout |

Card storage is not implemented in MVP.

## Notifications

| Channel | Service |
|---|---|
| Push | Firebase Cloud Messaging |
| Email | Resend |
| In-app | Firestore-backed |

## API

| Concern | Tool |
|---|---|
| Internal API | Nuxt Server Routes |
| API documentation | `@scalar/nuxt` |
| Approach | OpenAPI-first |

## Testing

| Type | Tool |
|---|---|
| Unit & integration | `@nuxt/test-utils` |
| E2E | Planned post-MVP |

## Quality

| Concern | Tool |
|---|---|
| Linting | `@nuxt/eslint` |
| Type checking | `vue-tsc`, `nuxt typecheck` |
| Accessibility | `@nuxt/a11y` |

## Mobile Strategy

MVP: responsive SPA + PWA.
Post-MVP: Capacitor → Android + iOS.
No native apps in MVP.
