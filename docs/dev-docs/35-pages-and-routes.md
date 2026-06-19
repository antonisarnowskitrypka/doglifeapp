# Pages & Routes (living index)

Running map of the Nuxt `app/pages` we'll need, with a **one-line** purpose each. Updated **as each UI view is defined** (see the UI sequencing plan). Modals/sheets are **not** pages. Provider context is scoped by the **active org in app state**, so provider URLs stay clean (no `orgId` in the path). SSR/indexable pages are marked **[SEO]**.

> **The marketing website lives elsewhere** (separate host). This app's `/` is the **in-app dashboard**, not a marketing page.

## Access model

Each page declares a **scope** via `definePageMeta({ context })`, enforced by the global `route-access` middleware:
- **public** — usable without login (`/`, `/search`, `/settings`). `/` shows a login/register invite for anonymous users.
- **shared** — any logged-in user, any context (`/notifications`, `/onboarding`, account part of `/settings`).
- **opiekun** — guardian-context routes; opening one auto-switches into Opiekun.
- **provider** — active-org routes (`/provider/*`); opening one from Opiekun auto-switches into a membership — preferring the **last org worked in** (`dl-last-org` cookie), else the first (or → `/onboarding` if none).

`/` redirects to `/provider` when the active context is an organization (decision: ui-docs/02).

**Auth is a modal, not a route.** Login/registration is a global `AppAuthModal` (tabs: Logowanie / Rejestracja), opened via `useAuthModal()` — there are **no `/login` or `/signup` pages**. Anonymous users hitting a login-required page are **not redirected**; the shell renders an `AuthTeaser` (temporary sign-up placeholder; final = illustration + marketing copy) in place of the content.

## Public
- `/` — **app dashboard**: Opiekun pulpit when logged in; login/register invite for anonymous (Szukaj + Ustawienia usable). **[public]**
- `/search` — marketplace search results. **[public, SEO later]**
- `/p/[orgSlug]` — provider public profile (Services / About / Chat); About shows the location on a **static map** (approximate for home-based providers — see [Geocoding & Maps](./36-geocoding-and-maps.md)). **[SEO]**
- `/courses/[slug]` — course landing + curriculum. **[SEO]**
- `/events/[slug]` — single event landing. **[SEO]**
- `/series/[slug]` — recurring event-series landing. **[SEO]**
- `/demo` — guided demo with simulated events.

## Auth & onboarding
- _(login / register = `AppAuthModal`, not routes — see Access model above.)_
- `/onboarding` — provider creator (org draft + owner membership) → later: checklist → Publish. **[shared]**

## Opiekun (guardian context)
- `/pets` — pets list.
- `/pets/[petId]` — pet detail / Life of Pet.
- `/bookings` — my bookings.
- `/bookings/[id]` — booking detail (Booking / Chat / History + session workspace).
- `/follows` — followed providers / searches / series.
- `/messages/[conversationId]` — 1:1 chat thread.
- `/notifications` — notification center.
- `/settings` — profile, billing details, context memberships, notification prefs.
- `/support` — support tickets list + new.

## Provider (active-org context)
- `/provider` — provider dashboard.
- `/provider/profile` — org profile editor (owner): name, description, logo, categories, species, invoice details.
- `/provider/me` — the member's own per-org profile (blurb, languages, org-scoped avatar).
- `/provider/settings` — provider "Więcej" hub (links to profile / me / staff / services …).
- `/provider/calendar` — week view (concrete weeks).
- `/provider/availability` — schedule builder / presets / generation.
- `/provider/bookings` — bookings inbox.
- `/provider/bookings/[id]` — booking detail + session workspace.
- `/provider/clients` — client list (+ ban).
- `/provider/services` — **single-service** CRUD (NOT events/courses/packages): name, category (within the org's), description, species, duration, per-mode delivery+pricing (gated by `organization.delivery`), booking mode, staff assignment (data-only for now), visibility. Precomputes `searchCells` on save. Owner-only. See [Search → service](./13-search.md#delivery-model).
- `/provider/locations` — **locations & delivery**: the three org-level delivery gates (online / travel-to-client / locations), the single shared travel base + radius (with a debounced static-map reach preview), and the location list — `fixed` venues and `area` ("in the field") entries, each with address autocomplete, optional photo, manual-coordinate fallback, and a confirm + static-map preview. A location must geocode (`geoStatus == 'ok'`) before its services are findable. Owner-only (staff see a read-only notice). See [Locations & Delivery UI](../ui-docs/03-locations-and-delivery.md) + [Geocoding & Maps](./36-geocoding-and-maps.md).
- `/provider/staff` — staff & permissions.
- `/provider/packages` — packages & courses management.
- `/provider/events` — events & recurring series.
- `/provider/equipment` — equipment registry.
- `/provider/templates` — content/session templates.
- `/provider/finance` — financial summary + invoices + QR.
- `/provider/analytics` — analytics & insights (free/Pro).
- `/provider/billing` — commission/Pro subscription + platform invoices.
- `/provider/promotions` — discount codes + promos + referrals.
- `/provider/settings` — org profile, locations, working hours, Google, terms/GDPR.

## Platform (super-admin)
- `/admin` — ops home; sub-routes for providers, disputes/chargebacks, support queue, platformConfig, moderation, catalogue.

> Entries are added/refined when their UI view is defined — keep this in sync with `ui-docs/`.
