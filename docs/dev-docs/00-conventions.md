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
