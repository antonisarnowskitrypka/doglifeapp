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

A **platform-defined catalogue** of standard questions with **stable keys** and **localised display** (labels/option text live in i18n `handling.json`, never in the data). The catalogue is the single source of truth in [`shared/utils/handling.ts`](../../shared/utils/handling.ts) (`HANDLING_CATALOGUE`) — plain TS so the app auto-imports it and the server imports it relatively (mirrors `shared/utils/geo.ts`).

Each question has an answer `type`:

- **`boolean`** — yes/no. Most carry `detail: true`: when answered "yes" the flow invites an **optional free-text follow-up** (e.g. medication → *which and how often*). Stored as `pets.handling[key]` (boolean) + `pets.handling[key + '_detail']` (string, when given).
- **`choice`** — single pick from a named **scale** (`SCALES[scale]`). Scales: `attitude` (friendly / neutral / unsure / reactive / aggressive), `tolerance` (calm / tolerates / with_difficulty / stressed / aggressive), `offleash` (yes / conditional / no), `alone` (yes / short / no). Stored as the option key (string).
- **`text`** — free text. Stored as a string.

Questions are grouped (`social`, `safety`, `health`, `care`, `logistics`, `training`, `guidance`) for the service form, and may be species-scoped (`species: ['dog']`, e.g. `in_heat`).

The MVP catalogue (23 keys): `attitude_people`, `attitude_dogs`, `attitude_children`, `bite_history_human`, `bite_history_dog`, `resource_guarding`, `muzzle`, `medication`, `allergies`, `health_limitations`, `fears`, `in_heat`, `grooming_vet_tolerance`, `handling_rules`, `offleash`, `alone_ok`, `car_travel`, `commands`, `group_experience`, `boarding_experience`, `rewards`, `warnings`, `avoid`.

### Service requirement

The provider configures a service's **form** in two sections (see [Pages & Routes](./35-pages-and-routes.md) → `/provider/services`):

```
// on service
requiredPetQuestions: string[]   // catalogue keys the customer must answer to book (subset of the catalogue)
customQuestions: CustomQuestion[]   // provider-authored, per-booking questions (see below)
```

**Section 1 — required handling fields.** The provider ticks which catalogue keys this service **requires**. Validated server-side against `isHandlingKey()`; unknown keys are dropped.

**Section 2 — custom questions** *(new — supersedes the earlier "providers do not define custom questions in MVP" rule)*. The provider authors their own questions whose answers typically **differ every booking, even from the same client** (e.g. *"co chcesz wypracować?"*, *"co Cię do nas sprowadza?"*). Shape:

```
CustomQuestion {
  id: string                  // stable per service
  label: string               // provider's text, stored verbatim (NOT an i18n key)
  type: 'short_text' | 'long_text' | 'single_choice' | 'multi_choice'
  options?: string[]          // verbatim, only for the choice types
  required?: boolean
}
```

The two sections differ by **where answers live**: handling answers persist on **`pets.handling`** (reused across bookings — the "90% the same" data); custom answers are captured **per booking** on `booking.customAnswers` (the "90% different" data) and are **not** written back to the pet.

This **form** is strictly *pre-booking intake*. The separate **"Schemat sesji"** action on the same service configures the *post-booking* session blueprint (pre-visit instructions, materials, recommendation/homework/metric templates) — a different object entirely; see [Templates → Schemat sesji](./29-templates.md#entry-point-schemat-sesji-per-service).

### At booking

For each required catalogue key, if `pet.handling[key]` is missing, the booking flow collects it and **persists it onto `pets.handling`** (with the optional `_detail` for boolean questions). Already-answered keys are pre-filled. Custom questions are always asked fresh and stored on `booking.customAnswers: { [questionId]: string | string[] }`. See [Booking a Service](../user-docs/07-booking-a-service.md).

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
