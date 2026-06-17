# Client History & Pet-Life Event Sharing

The booking-detail screen (provider and customer share the same layout) aggregates three tabs over one **owner + pet** relationship: REZERWACJA, CZAT, HISTORIA.

## Relationship Key

The relationship is keyed by `(organizationId, customerId, petId)`. It is **derived**, not a stored entity — there is no `relationship` document. Each tab assembles its data from existing collections filtered by that triple:

| Tab | Source |
|---|---|
| REZERWACJA | the current `booking` + its session workspace (notes, homework, recommendations, attachments) |
| CZAT | the `conversations` thread for `(organizationId, customerId)` — see [Provider Profile & Chat](./12-provider-profile-and-chat.md) |
| HISTORIA | all bookings + recommendations for the triple, plus shared pet-life events |

A customer with two pets has two distinct histories with the same org (different `petId`).

## Pet-Life Events

The pet's timeline. Part of MVP (the broader Life of Pet module and health reminders remain post-MVP).

### `petEvents`

```
id: string
petId: string
ownerId: string                // customer userId
type: 'vet_visit' | 'test_result' | 'training' | 'physio' | 'event' | 'note' | string
title: string
description: string
occurredAt: timestamp
attachments: Attachment[]       // shared Attachment shape (see Equipment doc)
source: 'manual' | 'platform_booking'
sourceBookingId: string | null  // set when generated from a completed booking
createdAt: timestamp
```

Platform-booking events are generated automatically on booking completion; manual events are added by the owner.

**All events are private by default** and hidden from every provider — including events generated from bookings with *other* providers on the platform. A provider only sees an event after the owner explicitly shares it (see below). The only events a provider sees without a share are the ones belonging to their own bookings (surfaced directly through the booking, not through the timeline).

## Sharing Model

Sharing is **per provider (organization)** and **revocable**. A grant document per `(event, organization)` supports revocation and audit.

### `petEventShares`

```
id: string
petEventId: string
petId: string
ownerId: string
organizationId: string          // provider the event is shared with
grantedAt: timestamp
revokedAt: timestamp | null      // null = active
```

### Queries

Events a provider may see for a pet:

```
petEventShares
  where organizationId == org
  where petId == pet
  where revokedAt == null
→ resolve petEventId → petEvents
```

Revoking = set `revokedAt` (keep the row for audit). Re-sharing creates a new active grant.

## HISTORIA Assembly (server)

For a provider viewing `(org, customer, pet)`:

1. Bookings: `bookings where organizationId == org && customerId == customer && petId == pet`, ordered by date.
2. Recommendations & progress from those bookings (the shared, customer-visible content — **not** the provider's private notes).
3. Shared events: active `petEventShares` for `(org, pet)` → `petEvents`.

Merge and sort chronologically. All assembled in a Nuxt server route — clients never query Firestore directly.

## Note Visibility

Session-workspace provider content has two visibility classes (see [Session Workspace](../user-docs/12-session-workspace.md)):

| Class | Field | Visible to customer |
|---|---|---|
| Private notes | `privateNotes` | No — provider-only, always |
| Recommendations / progress | `recommendations`, `progress` | Yes |

Customer-facing views (the customer's HISTORIA, their PDF export) must never include `privateNotes`. This is enforced server-side when assembling responses.

## Session Metrics

Each session (booking) can collect numeric/string metrics defined by the [session template](./29-templates.md#session-metric-fields) plus any ad-hoc fields added during the session.

```
// on the booking's session workspace
sessionMetrics: {
  key: string
  label: string
  type: 'number' | 'string'
  unit: string | null
  value: number | string
}[]
```

- **Always visible to the customer** (progress data) — unlike private notes.
- Metric definitions are denormalized onto each session's `sessionMetrics` so historical sessions keep their labels/units even if the template later changes.

### Session-to-session comparison

In HISTORIA, metrics are compared across the pet's sessions with this provider as a **table: rows = sessions (by date), columns = metrics**. Numeric and string values both shown as-is (no charts in MVP). Useful for physio tracking progress visit-over-visit.

## Access Control

- Owner: full access to their pet's events; controls grants (create / revoke). Sees recommendations/progress, never the provider's private notes.
- Provider (Owner/Staff of the org): read access to bookings and notes for their own org, and to **actively shared** pet-life events.
- Pet-life events are private by default — a provider sees only actively-shared events, never another provider's events implicitly.
- **Exception — handling attributes & health alerts** (`pets.handling`, `pets.medicalConditions`, `pets.contraindications`): functional/safety data, *not* timeline events and *not* governed by `petEventShares`. Handling answers surface to any provider whose service requires the key; medical conditions/contraindications surface **automatically and prominently** to the provider on every booking (see [Pets](./19-pets.md#visibility)).
- Enforced in server routes, not Firestore rules (see [Firebase & Security](./03-firebase-and-security.md)).
</content>
