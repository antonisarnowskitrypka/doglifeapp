# Pets

Data model for pet records, handling attributes, multi-pet bookings, and the deceased/deleted lifecycle.

## `pets`

```
id: string
ownerId: string                 // customer userId
species: 'dog' | 'cat'          // required
name: string                    // required
birthDate: timestamp            // required
breed: string                   // required
sex: 'male' | 'female'          // required
avatarUrl: string | null        // optional pet photo

// optional, added later
microchip: string | null
passportNumber: string | null
neutered: boolean | null
pedigree: string | null

handling: {                     // answers to platform handling-question catalogue
  [questionKey: string]: string | boolean | number
}

medicalConditions: string[]     // diseases/conditions, free text (e.g. 'cancer', 'advanced dysplasia')
contraindications: string[]     // things to avoid, free text

status: 'active' | 'deceased' | 'deleted'
deceasedAt: timestamp | null
createdAt: timestamp
updatedAt: timestamp
```

The platform currently supports dogs and cats (`species: 'dog' | 'cat'`).

A user may own many pets (`pets where ownerId == user`). The Life of Pet tab selects one `petId` at a time.

## Species & Provider Acceptance

Which species a provider serves is declared at two levels:

- **Org level** — `organization.acceptedSpecies: ('dog' | 'cat')[]`: the species the provider accepts overall.
- **Per service** — `service.species: ('dog' | 'cat')[]`: defaults to `organization.acceptedSpecies`. If the org accepts only one species, all its services are that species; if the org accepts both, the provider can choose the species per service.

`service.species` is denormalized onto the searchable document and drives species filtering — see [Search](./13-search.md).

## Handling Questions

A **platform-defined catalogue** of standard questions (stable keys, localised display): e.g. `is_aggressive`, `attitude_dogs`, `attitude_cats`, `fears`. Providers do **not** define custom questions in MVP — they only choose which catalogue keys their service **requires**.

### Service requirement

```
// on service
requiredPetQuestions: string[]   // catalogue keys the customer must answer to book
```

### At booking

For each required key, if `pet.handling[key]` is missing, the booking flow collects it and **persists it onto `pets.handling`**. Already-answered keys are pre-filled. See [Booking a Service](../user-docs/07-booking-a-service.md).

### Visibility

`handling` is **functional/safety data**, not a Life-of-Pet timeline event. It is surfaced automatically to any provider whose service requires the key — it is **not** governed by `petEventShares` (see [Client History & Sharing](./14-client-history-and-sharing.md)).

`medicalConditions` and `contraindications` are likewise **safety-critical functional data**: surfaced **automatically and prominently** to the provider receiving a booking (always on top — e.g. cancer, advanced dysplasia), and in the session workspace. Not governed by `petEventShares`. **UI requirement (flag for UI docs):** must be impossible to miss when accepting/handling a booking.

## Multi-Pet Bookings

A booking can reference multiple pets:

```
// on booking
petIds: string[]
```

- **Occupancy/capacity**: each pet consumes one spot — a booking for N pets takes N spots against a `fixed_event` capacity or a `stay` occupancy (see [Calendar & Availability](./06-calendar-and-availability.md)).
- **Pricing**: configured per service —

```
// on service
multiPetPricing: 'per_pet' | 'per_booking'
```

  - `per_pet` → `price * petIds.length`
  - `per_booking` → flat price regardless of pet count

  Here `price` is the price for the **chosen delivery mode** (see [Search: per-mode pricing](./13-search.md)).

Pricing is applied before promotions/discounts in the [pricing order](./15-provider-dashboard.md#pricing--commission-order).

## Custom Life-of-Pet Events Across Pets

When the owner adds one custom event to several pets, create **one `petEvent` per pet** (so each carries its own attachments/results), linked by a shared `eventGroupId`:

```
// on petEvent (see Client History & Sharing)
eventGroupId: string | null      // shared across the pets added together
```

This lets "joint vet visit, result A for pet A, result B for pet B" stay per-pet while remaining grouped for display/editing.

## Lifecycle: Deceased & Delete (danger zone)

- **Deceased** (`status: 'deceased'`, set `deceasedAt`): history and events are retained; booking-creation routes reject new bookings for the pet. Surfaced in UI as "Crossed the rainbow bridge".
- **Delete** (`status: 'deleted'` / hard delete): removes the pet. Decide retention of linked history per data-retention policy; default to soft-delete to preserve provider records and invoices.

Both actions live in the pet's danger zone and require explicit confirmation.

## Access Control

- Owner: full control of their pets.
- Providers: see pet data relevant to their bookings — required `handling` answers (functional) and explicitly shared timeline events. Enforced server-side.
</content>
