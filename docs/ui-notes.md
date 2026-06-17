# UI Notes (scratchpad for future UI docs)

Running list of UI-specific decisions and requirements flagged during spec work, to fold into the dedicated UI docs later. Not a spec — a parking lot.

> Promoted to [ui-docs/](./ui-docs/README.md): **Availability Builder** (weekly slot builder, schedule presets, term auto-generation) → [ui-docs/01](./ui-docs/01-availability-builder.md).

## Flagged so far

- **Category colour/icon** — each main service category has a dominant colour + icon. **Provisional palette** defined in [ui-docs/00](./ui-docs/00-ui-basics.md#category-palette-provisional); final values + icons TBD with brand. Used across search, service cards, provider menu, Life of Pet timeline. (see Service Categories)
- **Cross-category autocomplete** — suggestion from another category shown with that category's icon + colour; selecting switches the active category.
- **Absence vs existing bookings** — conflicting confirmed bookings must be shown **very prominently** (hard-to-miss warning when adding an absence and in the day view); never silently overlooked. *(explicit user requirement)*
- **Short vs long descriptions** — `shortDescription` always by avatar/name; `longDescription` behind a "show more" affordance (organization, service, staff).
- **Boosted slot** — public promo slot shows a **promo badge** + reduced price in search/profile.
- **Day-plan quick actions** — one-tap "block as break" and "boost slot" on a gap in the day view (no deep calendar editing).
- **Confirmed review badge** — "Confirmed" badge on platform-booked reviews.
- **Provider onboarding** — new provider is `draft`/hidden; main screen shows an **onboarding checklist** (Stripe, calendar, services, …); when complete, a big **"Publish"** button flips the org to live.
- **Visit proposal card** — chat "Propose a visit" renders as a card the customer can open (prefilled booking) or dismiss.
- **Group-event chat** — group thread vs the profile 1:1 thread; client thread-mode toggle (everyone / provider-only).
- **Pet health alerts** — `medicalConditions` / `contraindications` (e.g. cancer, advanced dysplasia) must be shown **always on top / impossible to miss** for the provider receiving or handling a booking. *(safety requirement)*
- **Certificate template** — platform-predefined PDF background with fixed slots (owner+pet name, course/event, school, logo, date, signature PNG); exact layout/fonts TBD. Custom templates post-MVP.
- **QR export** — printable export (reception/social) for org / course / event QR codes; print-ready format & styling TBD.
- **Course page & event page** — each has its own public, indexed landing page (layout TBD); courses show curriculum/lessons.
