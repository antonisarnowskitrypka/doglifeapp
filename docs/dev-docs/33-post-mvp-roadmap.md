# Post-MVP Roadmap

The single place that tracks everything deliberately **out of scope for MVP** — parked decisions scattered across the other docs, plus net-new ideas not yet specced. This is a planning reference, not a build spec: items here have no data model or implementation commitment until they're pulled into their own doc.

When an item graduates, move its detail into the relevant spec/doc and leave a one-line back-reference here.

## New ideas (not yet specced)

Recorded as one-liners — design discussion happens before any of these are modelled.

- **Native mobile apps (iOS / Android)** — ship the platform as installable native apps (Capacitor over the existing app is the presumed path — see [Tech Stack](./02-tech-stack.md)), not just a responsive PWA.
- **Tap to Pay (phone-as-terminal)** — let providers accept in-person card payments directly on their phone (Stripe Tap to Pay), so on-site bookings can be charged without external hardware.
- **Weekly trainer tasks** — recurring weekly assignments a trainer sets for the client/pet (an extension of the current opt-in homework reminder — see [Notifications](./09-notifications.md#triggered-events)).
- **Achievements** — gamification: badges/milestones for owners and pets (e.g. completed courses, streaks), surfaced on the pet profile.
- **Pet travel passport** — a travel-document section inside Life of Pet collecting trips, vaccinations relevant to travel, and entry requirements (extends the parked "pet travel & activity rankings" idea — see [Client History & Sharing](./14-client-history-and-sharing.md)).

## Parked items (decided, deferred)

### Payments & finance

- **Disputes & chargebacks resolution** — the `disputed` state, Stripe `charge.dispute.*` webhook handling and super-admin resolution flow (see [Payments](./07-payments.md), [Disputes](./27-disputes.md), [Super Admin](./24-super-admin.md), [Booking State Machine](./05-booking-state-machine.md)).
- **Per-km travel surcharge** — `at_client` pricing is flat in MVP; distance-based surcharge parked (see [Search](./13-search.md), user [Provider Setup](../user-docs/17-provider-setup.md)).
- **Full fiscal invoices** — MVP issues "simplified" invoices only; strict per-entity sequential numbering, fuller VAT/tax and per-country rules later (`invoice.kind` is the extension point — see [Provider Dashboard](./15-provider-dashboard.md)).
- **More Pro premium features** — the €11/mo provider **Pro** subscription ships in MVP with Search Boost + auto Google Meet links (see [Platform Billing](./15-provider-dashboard.md#platform-billing--subscription)); further premium perks and additional plan tiers come later.
- **Owner premium subscription** — paid tier for pet owners unlocking extra (mainly health) features; scope TBD (see user [Life of Pet](../user-docs/15-life-of-pet.md), user [Platform Overview](../user-docs/01-platform-overview.md)).
- **Referral cashback** — referrer's share of platform commission from a referred provider's transactions, over a defined period (e.g. a `referralEarnings` ledger — see [Referrals](./18-referrals.md)).

### Search & discovery

- **Full-text search** — Firestore-only MVP has no tokenization / fuzzy / relevance ranking; add an external engine (Typesense / Meilisearch / Algolia) synced from Firestore as an additive step (see [Search](./13-search.md)).
- **Dual-species "More" menu placement** — alternative location for the species selector for dual-species owners (see [Search](./13-search.md)).
- **Dynamic / interactive maps** — MVP shows static map images only; interactive tiles, panning, and pin-drop are parked (see [Geocoding & Maps](./36-geocoding-and-maps.md)).
- **Searcher address autocomplete** — provider location setup uses autocomplete; searcher input is free-text + GPS in MVP (see [Geocoding & Maps](./36-geocoding-and-maps.md)).
- **Reverse-geocode "near {city}" label** — "use my location" uses GPS coordinates directly in MVP; a reverse-geocoded label is parked (see [Geocoding & Maps](./36-geocoding-and-maps.md)).

### Pets, health & Life of Pet

- **Health reminders** — scheduled vaccination/deworming reminders at user-configured intervals (see [Notifications](./09-notifications.md#health-reminders-post-mvp)).
- **Veterinary integrations** — connectivity with health providers (see user [Platform Overview](../user-docs/01-platform-overview.md)).
- **Pet travel & activity rankings / leaderboards** — see new-ideas "Pet travel passport" above (see user [Platform Overview](../user-docs/01-platform-overview.md)).

### Reviews

- **Maintained aggregate counters** — org and person review aggregates are computed on read in MVP; back them with denormalized counters (organization doc / specialist doc) if read volume grows (see [Reviews](./16-reviews.md)).

### Analytics & Insights

The [Analytics & Insights](./34-analytics-and-insights.md) pipeline ships in MVP (basic free, advanced on Pro). Parked extensions:

- **ML/AI-based forecasting** — MVP predictions are **deterministic statistics only** (moving averages, linear fit, seasonal index). Model-based forecasting is parked.
- **Public trust badge** — trust score is a private provider insight in MVP; surfacing it publicly is deferred (risk of penalising new/low-volume providers, gaming).
- **Trust score in marketplace ranking** — ranking stays distance + org weighted rating + Search Boost; feeding trust score into ranking is a separate ranking-policy change, parked.
- **Counter-increment impressions at scale** — MVP writes one `search_impression_set` per search; a per-org counter-increment optimization is parked for if write volume demands it.
- **GDPR erasure of raw analytics events** — raw `analyticsEvents` use TTL retention; hard erasure/anonymization is parked with the broader GDPR-erasure item below.

### Certificates

- **Custom certificate templates** — provider-designed layouts beyond the single platform background (see [Certificates](./32-certificates.md), user [Certificates](../user-docs/28-certificates.md)).

### Data, privacy & storage

- **GDPR erasure** — hard deletion / anonymization beyond soft delete, with a data-retention policy (see [Conventions](./00-conventions.md), [Storage](./23-storage.md), [Payments](./07-payments.md)).
- **Upload antivirus / malware scanning** — revisit before broadly opening uploads to external users (see [Storage](./23-storage.md)).

### Engineering

- **E2E tests** — unit & integration in MVP; end-to-end added later (see [Tech Stack](./02-tech-stack.md)).

## UI specifics

Concrete visual values (category colours/icons, layouts, badges, print-ready QR, certificate positioning, "show more" affordances, day-plan quick actions) are tracked separately in [ui-notes.md](../ui-notes.md) pending dedicated UI docs — not duplicated here.
