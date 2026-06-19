# Data Conventions

Cross-cutting rules every collection and server route follows. The foundation for the Firestore schema.

## Money

- All monetary amounts are stored as **integers in the currency's minor units** (cents/grosze/stotinki). Never floats.
- Every amount is paired with a currency from its owning organization.
- **One currency per provider (organization)** — `organization.currency` (ISO 4217, e.g. `EUR`, `PLN`, `BGN`). All of that org's services, bookings, packages, payouts, and invoices use it. No multi-currency within an org.

## VAT / Tax

- The provider sets their **VAT rate** (`organization.vatRate`, percent). Prices are shown VAT-inclusive with a note: *"price includes X% VAT"*.
- Customers may store **company billing details** on their account and request a company invoice (see [Accounts & Membership](./20-accounts-and-membership.md), [Provider Business Dashboard](./15-provider-dashboard.md)).

## Time & Time Zones

- All timestamps stored in **UTC** (Firestore `Timestamp`).
- Each organization has a **time zone** (`organization.timezone`, IANA, e.g. `Europe/Warsaw`, `Europe/Sofia`, `Europe/London`).
- Slot generation, availability, and date-based search are computed in the org's time zone, then stored/compared in UTC.
- **DST handled** via IANA zones. Target region for now: Europe (UK → Bulgaria), but the model is global.

## Geo / Coordinates

- Coordinates are stored as plain `{ lat, lng }` decimal degrees (**WGS84**, ≤ **6 decimal places** ≈ 0.1 m), **never** a Firestore `GeoPoint` — we query geographically via H3 + haversine, not native geo, so plain numbers stay JSON-clean across the Admin SDK ↔ route ↔ SSR boundary.
- Country is stored as `countryCode` (**ISO 3166-1 alpha-2**, e.g. `PL`, `GB`, `BG`).
- Addresses are turned into coordinates **server-side only** (secret key); clients never call a geocoder directly. Geocoded results are **denormalized-and-documented**: the source of truth is the provider-confirmed `location`, recomputed when its `address` changes. Full spec: [Geocoding & Maps](./36-geocoding-and-maps.md).
- `geocode.precision` (`rooftop | street | postcode | city | approximate | manual`) and `geoStatus` (`pending | ok | low_confidence | failed`) are lower_snake_case enums (see [Enums](#enums)).

## Identifiers

- Document IDs are server-generated opaque strings (Firestore auto-IDs or UUIDs). Never embed business meaning in IDs.
- `users.id` equals the Firebase Auth `uid`.
- Cross-references are stored as ID strings (e.g. `organizationId`, `customerId`, `petId`).

## Collection Structure

- Tenant-scoped, high-volume, or independently-queried entities are **top-level collections** with an `organizationId`/`ownerId` field (e.g. `bookings`, `services`, `pets`, `reviews`) — enables cross-entity queries and simple security scoping.
- Tightly-owned, always-accessed-with-parent data uses **subcollections** (e.g. `conversations/{id}/messages`, `equipment/{id}/serviceLog`).

## Standard Fields

Every document carries:

```
createdAt: timestamp
updatedAt: timestamp
```

Where relevant:

```
createdBy: string          // userId
status: string             // entity-specific enum
```

## Soft Delete

- Default to **soft delete**: a `status` value (e.g. `deleted`, `deceased`, `cancelled`) or `deletedAt`, never a hard delete, to preserve invoices, history, and audit trails.
- Hard deletion / anonymization is reserved for GDPR erasure (parked — see [Payments](./07-payments.md) parked items).

## Enums

- Enum values are **lower_snake_case** strings (`awaiting_payment`, `at_client`, `price_adjustment_requested`).
- Localized display strings are resolved client-side from stable enum keys, never stored as display text.

## Descriptions

Profile-bearing entities — **organization** (provider), **service**, and **staff** (`organizationMembers`) — carry a consistent pair:

```
shortDescription: string        // always shown next to the avatar/name
longDescription: string | null  // revealed via "show more" (exact UI TBD in UI docs)
```

- `shortDescription` is the always-visible blurb; `longDescription` is the expandable detail.
- For staff this is the **professional** description in the org context (distinct from the personal `users.bio`).
- The organization's former single profile "description" is this pair.

## Denormalization

- Denormalize for read/query needs, and document the source of truth + when to recompute.
- Known denormalizations: `service.languages` (union of staff languages), `service.searchCells` (H3 coverage), invoice/policy **snapshots** (frozen at issue/acceptance time).

## Server Authority

- Clients never write business data directly to Firestore. All mutations go through Nuxt server routes with the Admin SDK (see [Architecture](./01-architecture.md), [Firebase & Security](./03-firebase-and-security.md)).

## i18n

**Never hardcode user-facing text.** Every string a user can read goes through an i18n key — labels, placeholders, hints, headings, button text, toast/alert titles & descriptions, validation messages, `useHead`/SEO titles, `aria-label`s, and Polish defaults in `defineProps`. (Only `pl` is populated for now; `en`/`bg` fall back to `pl` via `i18n/i18n.config.ts`.)

### Catalog layout — file name == top-level key

One JSON file per namespace under `i18n/locales/<locale>/<namespace>.json`, registered in `nuxt.config.ts` (`i18n.locales[].files`). Each file's single top-level key **is** the namespace, so the key prefix tells you the file:

```
i18n/locales/pl/
  common.json       common.*       actions (save/cancel/…), labels, roles, locales, uploader, seo, generic toasts
  validation.json   validation.*   form validation messages
  errors.json       errors.*       Firebase Auth error map + generic fallbacks
  nav.json          nav.*          sidebar / bottom nav / breadcrumb labels (single source for route labels)
  auth.json         auth.*         login/signup/reset modal, social, email-verify banner, teaser
  account.json      account.*      /settings: profile, invoice, password, delete
  appSettings.json  appSettings.*  notifications / language / appearance
  provider.json     provider.*     provider pages + settings hub + staff form
  onboarding.json / home.json / opiekun.json   onboarding, opiekun home, opiekun placeholder pages
```

### Key naming & usage

- Keys are `namespace.section.element` in **camelCase** (e.g. `auth.login.title`, `provider.staff.inviteButton`, `account.delete.confirmBody1`).
- Named interpolation only: `"body": "Wysłaliśmy link na {email}."` → `t('auth.verify.body', { email })`.
- Templates: `$t('key')`. Script/composables: `const { t } = useI18n()` then `t('key')`. Building reactive arrays (nav items, select options) — wrap in `computed(() => …t())` so labels react to locale.
- **Reuse before adding.** Check `common`, `validation`, `errors`, `nav` first; only create a domain key when nothing generic fits. A generic string used in 2+ namespaces belongs in `common` (e.g. `common.toast.saveError`). Same text in different *meanings* may legitimately be separate keys (they can diverge in translation).
- Firebase Auth errors (client) map through the `useAuthError()` composable (code → `errors.auth.*` key), not inline.

### Server-side errors

The server has no vue-i18n, so routes **return a key, not text**. Throw with the `apiError()` util (`server/utils/apiError.ts`):

```ts
throw apiError(409, 'errors.api.staff.alreadyMember')   // statusMessage = the key; data.i18nKey carries it
```

Messages live under `errors.api.<domain>.<element>` in `errors.json`. The client resolves them with `useApiError().apiErrorMessage(e, fallbackKey)` — it reads `error.data.i18nKey`, translates it, and falls back to `fallbackKey` (a local key) then `errors.generic`. Use `apiErrorMessage` in every catch that handles a `$fetch`/server error (use `authErrorMessage` for Firebase client errors). Purely technical guards that never reach the UI (401 `Missing auth token`, 404 `User profile not found`) stay as short English `createError`.
