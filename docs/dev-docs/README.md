# Developer Documentation

Technical reference for engineers working on the platform.

> UI flow/layout specs live in the sibling [ui-docs/](../ui-docs/README.md) tree.

## Sections

- [00 — Data Conventions](./00-conventions.md) — money, time zones, IDs, enums, soft delete, denormalization
- [01 — Architecture](./01-architecture.md) — system design, rendering strategy, data flow
- [02 — Tech Stack](./02-tech-stack.md) — frameworks, modules, and services
- [03 — Firebase & Security](./03-firebase-and-security.md) — SDK split, access rules, security model
- [04 — API Design](./04-api-design.md) — server routes, OpenAPI-first, Scalar docs
- [05 — Booking State Machine](./05-booking-state-machine.md) — status transitions and rules
- [06 — Calendar & Availability](./06-calendar-and-availability.md) — service types, slot generation, petsitting
- [07 — Payments](./07-payments.md) — Stripe Connect, escrow flow, webhooks
- [08 — Packages & Courses](./08-packages.md) — packages vs courses (indexed page, lessons, pacing), session consumption
- [09 — Notifications](./09-notifications.md) — architecture, FCM, Resend
- [10 — Development Setup](./10-development-setup.md) — local dev, commands, conventions
- [11 — Equipment Registry](./11-equipment.md) — data model, visibility, inspection reminders
- [12 — Provider Profile & Chat](./12-provider-profile-and-chat.md) — profile tabs, conversation model
- [13 — Search](./13-search.md) — delivery model, H3 geospatial matching, date/availability filtering
- [14 — Client History & Sharing](./14-client-history-and-sharing.md) — relationship key, pet-life events, per-provider revocable sharing
- [15 — Provider Business Dashboard](./15-provider-dashboard.md) — finances, invoices, platform billing/subscription, discounts & promotions
- [16 — Reviews](./16-reviews.md) — review model, Confirmed badge, highlight tags, aggregation
- [17 — Banning a Client](./17-client-ban.md) — provider-level ban model and enforcement
- [18 — Referrals](./18-referrals.md) — vouchers, commission overrides, money flows
- [19 — Pets](./19-pets.md) — pet model, handling catalogue, multi-pet bookings, deceased/delete lifecycle
- [20 — Accounts & Membership](./20-accounts-and-membership.md) — auth, phone verification, multi-org membership, staff invites
- [21 — Provider Terms & GDPR](./21-terms-and-gdpr.md) — versioned policies and acceptance records
- [22 — Permissions Matrix](./22-permissions-matrix.md) — Owner/Staff/Customer capabilities, staff finance rule
- [23 — File Storage](./23-storage.md) — Storage paths, upload flow, limits/types, thumbnails
- [24 — Super Admin](./24-super-admin.md) — platform role, disputes, commission config, moderation, platform bans
- [25 — Demo Page](./25-demo.md) — isolated demo namespace, guided tour, button-triggered simulation
- [26 — Contact Support](./26-contact-support.md) — support tickets model, replies, super-admin queue
- [27 — Disputes](./27-disputes.md) — open flow, evidence, link to super-admin resolution
- [28 — Service Categories](./28-service-categories.md) — platform category catalogue, colour/icon, search integration
- [29 — Templates](./29-templates.md) — content templates and service/lesson auto-setup templates
- [30 — Google Integration](./30-google-integration.md) — one-way Calendar sync (per staff) + auto Google Meet links
- [31 — Follows](./31-follows.md) — following providers and saved searches, with batched alerts
- [32 — Certificates](./32-certificates.md) — auto PDF certificates for events/courses, signature/logo
- [33 — Post-MVP Roadmap](./33-post-mvp-roadmap.md) — parked decisions + new ideas (native apps, Tap to Pay, weekly tasks, achievements, travel passport)
- [34 — Analytics & Insights](./34-analytics-and-insights.md) — event pipeline, rollups, free/premium metrics, deterministic predictions, benchmarks, trust score
- [35 — Pages & Routes](./35-pages-and-routes.md) — living index of Nuxt `app/pages` (one-line purpose each), updated as UI views are defined
