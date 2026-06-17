# Calendar & Availability

## Google Calendar Sync

Bookings and absences/blocks can sync **one-way** to a staff member's Google Calendar (platform → Google; changes in Google don't flow back). See [Google Integration](./30-google-integration.md).

## Time Zones

Each organization has a time zone (`organization.timezone`, IANA — see [Conventions](./00-conventions.md)). Availability and slots are computed in the org's zone, with **DST handled** via the IANA database, then stored/compared in **UTC**. Target region for now: Europe (UK → Bulgaria).

## Working Hours

The organization sets **default working hours** — a soft baseline used to seed the schedule UI:

```
// on organization
workingHours: {
  days: number[]                 // working weekdays, e.g. [1,2,3,4,5,6] = Mon–Sat
  start: 'HH:mm'                 // e.g. '09:00'
  end: 'HH:mm'                   // e.g. '18:00'
}
```

This is a **soft default only**: it pre-fills the empty week and the default hours in the [Availability Builder](../ui-docs/01-availability-builder.md). Windows **may** be created outside it when needed — it does not hard-cap availability.

## Staff Availability

Each staff member has a **default weekly schedule** (`availabilityTemplate`) of recurring windows, interpreted in the org time zone, and grouped under a [schedule preset](#schedule-presets). Bookable terms are generated from the active preset (see [Availability Generation](#availability-generation)).

### Availability window

A window is more than just hours — it carries the full context under which bookings are allowed in that time. Windows are produced by the [Availability Builder](../ui-docs/01-availability-builder.md), which compiles a multi-staff/multi-day block into one window per (staff × weekday):

```
// availabilityTemplate window (per staff, per weekday)
dayOfWeek: 0–6
start: 'HH:mm'
end: 'HH:mm'
deliveryModes: ('online' | 'at_client' | 'at_location')[]   // one OR MORE allowed in this window
locationIds: string[]                                        // applicable locations (for at_location)
serviceIds: string[]                                         // services offered in this window (subset feasible for the staff/mode/location)
bookingModeOverride: 'book_now' | 'request' | 'inquiry' | null  // e.g. weekend → request; null = use service default
templateId: string                                           // the schedule preset this window belongs to
```

- A window may allow **several delivery modes and/or locations at once** (e.g. onsite at location A + online in the same hours); the customer picks one when booking.
- **`serviceIds`** scopes which services this window offers. The builder only lets you add services feasible for the chosen staff (`service.staffIds`), mode, and location; a slot is offered for a service only where it is in `serviceIds` **and** the window's `deliveryModes`/`locationIds` intersect what the service supports.
- `bookingModeOverride` lets the provider force a mode for that window (e.g. *weekends are request-only*), overriding the service's default booking mode for slots in that window.

### Schedule presets

A provider can keep **up to 3 named schedule presets** (e.g. *Regular*, *Summer*), one marked **active**:

```
// scheduleTemplates (max 3 per organization)
id: string
organizationId: string
name: string
isActive: boolean
createdAt: timestamp
```

Each `availabilityTemplate` window belongs to a preset via `templateId`. Presets are edited independently. **Switching the active preset does not rewrite already-generated weeks** — it only changes which preset future generation draws from.

### Availability generation

Bookable terms for upcoming weeks are produced by projecting the **active preset** onto concrete dates, up to a horizon:

```
// on organization
availabilityGeneration: {
  mode: 'auto' | 'manual'
  dayOfWeek: 0–6 | null          // for auto: which weekday the job runs
  weeksAhead: number             // horizon; default 3
}
```

- **`auto`** — a scheduled Cloud Function runs each `dayOfWeek` and materializes any missing weeks within `weeksAhead` from the **active** preset (e.g. *every Sunday, ensure terms exist 2 weeks out*).
- **`manual`** — no job; the provider rolls the horizon forward on demand ("Generate next weeks") from the active preset.
- Each generated week **records the preset it was generated from** (`appliedTemplateId`), so its slots derive from that snapshot — **switching the active preset never rewrites past/already-generated weeks**; only newly generated weeks use the new active preset.
- A generated week is **concrete and individually editable** in the [Week view](../ui-docs/01-availability-builder.md#week-view): per-week edits change that week's real availability without touching the preset (the provider may optionally push a week's changes back via *Update template* / *Save as new template*). Editing an active slot that has bookings surfaces a prominent conflict warning (bookings are never silently dropped).
- `weeksAhead` is also the look-ahead the customer sees, and the depth date-based [search](./13-search.md#date-filtering) checks availability against.

### Slot granularity

`organization.slotGranularityMinutes` — at what increments customers may start a booking: `60` (full hours), `30`, or `15`. Provider setting.

### Operational buffer

`service.operationalBufferMinutes` (per service; defaults to an org-level global) — rest/prep time **after** each appointment. The customer sees the service duration `D`; the calendar reserves `D + buffer`, so the next bookable start is after the buffer. (Prevents selling a 60-min slot for a service that is really 50 min + 10 min turnaround.)

Slots for `scheduled` services are derived from all of the above, interpreted in the org time zone.

## Staff Schedule Permissions

Two **organization-level** toggles (set by the Owner in settings) govern how much staff can self-manage their time. They are **independent**:

```
// on organization
staffCanEditOwnSchedule: boolean   // default true — staff may edit their own availabilityTemplate (weekly schedule)
staffAbsenceAutoAccept: boolean    // default true — staff absences apply immediately; false → Owner approval required
```

- **`staffCanEditOwnSchedule`** gates editing of the **weekly template** only. When `false`, only the Owner edits a staff member's weekly schedule; the staff member's edit actions are blocked server-side.
- **`staffAbsenceAutoAccept`** governs **absences** only (the separate exceptions path below), independently of the schedule toggle — so staff can still request absences even when weekly-schedule editing is locked.
- Owner-created absences are always applied immediately regardless of the toggles (the Owner doesn't approve themselves).

## Availability Exceptions (absences)

A **separate path** from editing the weekly template: an absence **overrides** the generated calendar — no need to dig into a specific day's windows.

```
// availabilityExceptions
id: string
staffId: string
date: date                      // or a date range (startDate/endDate)
scope: 'full_day' | 'partial'
start: 'HH:mm' | null           // for partial
end: 'HH:mm' | null
type: 'absence' | 'break'
reason: string | null
status: 'active' | 'pending' | 'rejected'   // pending only for a staff request while staffAbsenceAutoAccept=false
createdBy: string               // userId (staff or owner)
```

- `full_day` greys out the whole day; `partial` blocks a slice.
- **Approval flow:** a staff-created absence is `active` immediately when `staffAbsenceAutoAccept` is `true`; when `false` it is `pending` and the Owner approves (`→ active`) or rejects (`→ rejected`). Owner-created absences are `active` at once.
- **Only `active` exceptions block slots.** A `pending` request does **not** hold the slots — they stay bookable until the Owner approves; if a booking lands in the requested window before approval, the normal [overlap-conflict](#availability-exceptions-absences) handling applies (surfaced to the provider, not auto-cancelled).
- Active exceptions win over the template when generating slots. Existing confirmed bookings in a blocked range are **not** auto-cancelled — surfaced to the provider to handle.
- **UI requirement (flag for UI docs):** these conflicting bookings must be shown **very prominently** — a hard-to-miss warning/blocker when adding the absence and in the day view — so the provider can never silently overlook an already-booked appointment.

## Day-Plan Quick Actions

On the provider's day view, a gap between bookings supports two **one-tap** actions (no deep calendar editing):

- **Block as break** — creates a short `availabilityExceptions` (`type: 'break'`) over the gap so nobody books it.
- **Boost slot** — publishes that specific slot as a **one-off public promotional slot**: it appears in [search](./13-search.md)/profile with a reduced price and a **promo badge** to sell it quickly.

```
// slotPromotions (boosted slot)
id: string
staffId: string
serviceId: string
start: timestamp
end: timestamp
promoPrice: number              // minor units, org currency
badge: true
expiresAt: timestamp            // typically the slot start
```

A boosted slot's promo price feeds the [pricing order](./15-provider-dashboard.md#pricing--commission-order) as the base price for that slot.

## Staff ↔ Service Assignment

Each service lists the staff qualified to deliver it; this drives both slot generation and booking-time selection.

```
// on service
staffIds: string[]              // organizationMembers qualified to deliver this service
                                // (solo org: just the owner; defaults to the owner on creation)
```

- A staff member is offered for a service only if listed in `service.staffIds` (a subset of the org's `organizationMembers`). Example: a school offers Training, Behaviour, Nosework — Eliza ∈ {Training, Behaviour}, Julka ∈ {Training, Nosework}.
- **Slot generation (`scheduled`):** a service's bookable slots are the **union** of the availability of its qualified staff, each minus that staff's own bookings, exceptions, operational buffers, **and event commitments** — a `fixed_event` the staff member is assigned to run occupies them (event window + buffer), removing them from other bookable supply then (see [Staff Availability](#staff-availability)).
- **Booking-time selection:** the customer may pick a **specific** qualified staff member or leave it as **"Any available"** (the default).
  - **Specific staff** → only that staff's free slots are offered; `booking.staffId` = the chosen member.
  - **Any available** → slots are the union across qualified staff; at booking time the system **auto-assigns the least-loaded** qualified staff who is free for that slot — **fewest bookings that day**, ties broken **randomly**. `booking.staffId` is set to the result.
- **`fixed_event`:** the event is created with its own assigned staff (leader / [guest leaders](./08-packages.md#guest-leaders)), so there is no per-booking staff choice for events.
- **Owner reassignment:** the **Owner** can change a booking's `staffId` to **another qualified staff** (must be in `service.staffIds`) at any time. If the target is **not free** for the slot, the reassignment is still allowed but raises a **prominent overlap warning** (the same hard-to-miss treatment as [absence conflicts](#availability-exceptions-absences)). Reassignment notifies the previously assigned staff, the newly assigned staff, and the customer (see [Notifications](./09-notifications.md)).

## Service Scheduling Types

### Scheduled

A time-slotted service (consultation, training session).

- Slot availability is derived from the working hours of the **staff qualified for that service** (`service.staffIds` — see [Staff ↔ Service Assignment](#staff--service-assignment)).
- Duration is defined per service.
- One booking occupies one slot.

### Fixed Event

A group event on a specific date with a fixed capacity.

Examples: group walk, seminar, workshop.

- Created for a specific date/time.
- Has a maximum animal count (capacity).
- Customers book into available spots.
- Has a **group-event chat** for all enrolled participants — see [Provider Profile & Chat](./12-provider-profile-and-chat.md#group-event-chat).
- **Occupies its assigned staff:** the leader/co-leaders running the event are unavailable for other `scheduled` bookings during the event window (+ buffer); the event shows on the [Week view](../ui-docs/01-availability-builder.md#week-view) as a committed block.

#### Recurring event series

An event can be **recurring** — a parent `eventSeries` over many occurrences. **Every occurrence is a fully independent `fixed_event`**: its own capacity, enrollment, [group chat](./12-provider-profile-and-chat.md#group-event-chat), [session](../user-docs/12-session-workspace.md), reviews and certificate. The series only groups them and supplies **defaults**; cancelling/changing one occurrence never touches the others.

```
// eventSeries — parent; has its own public, indexed page (see Search: indexing)
id: string
organizationId: string
serviceId: string               // the underlying fixed_event service
slug: string                    // own indexed public page URL
title: string
shortDescription: string
longDescription: string | null
categoryKey: string
level: 1 | 2 | 3 | null
datesMode: 'preset' | 'open'    // see below — both are "recurring"
defaults: {                     // each occurrence inherits these; provider may override per occurrence
  capacity: number
  price: number                 // minor units, org currency
  durationMinutes: number
  deliveryMode: 'at_location' | 'at_client' | 'online'
  locationId: string | null
  sessionTemplateId: string | null
}
status: 'draft' | 'active' | 'archived'
createdAt: timestamp
```

Each occurrence is a normal `fixed_event` with a back-reference:

```
// on fixed_event (occurrence)
seriesId: string | null         // null = standalone one-off event
// capacity/price/duration/location/sessionTemplate default from series.defaults, overridable
```

**Two ways to populate dates (one "recurring" mode, two date strategies):**

- **`preset`** — the provider adds **several dates up front** (e.g. weekly Friday walks), optionally via a simple weekly helper. This **materializes concrete, independent occurrences** immediately.
- **`open`** — the provider knows it will recur but **not when yet** (spontaneous, weather/turnout dependent). No occurrences exist until the provider adds them one at a time later. The series page shows "no upcoming dates — follow to be notified."

**Discovery & enrollment:**

- The **series page** lists upcoming occurrences. Customers can enrol per occurrence, or **multi-select several occurrences** and pay together — which still creates **separate, independent bookings** (one per occurrence).
- Customers can **follow the series**; adding a new occurrence notifies followers (see [Follows](./31-follows.md) — important for the `open` variant).

### Stay

Petsitting — a service with a `startDatetime` and `endDatetime`.

- Does not block the entire day.
- Modelled on **occupancy** — the provider sets a maximum number of simultaneous animals and/or places.
- Multiple stays can overlap up to the occupancy limit.

## Petsitting Configuration

Providers can set:
- Maximum number of animals at once
- Maximum number of places (if different from animal count, e.g. one place per household)

## Booking Mode per Service

Each service independently sets its booking mode (`service.bookingMode: 'book_now' | 'request' | 'inquiry'`):

| Mode | Behaviour |
|---|---|
| `book_now` | Pick slot → pay → confirmed instantly |
| `request` | Pick slot → pay → 24h provider confirmation (approve / propose new time / cancel) |
| `inquiry` | Customer inquires → provider quotes → customer pays |

Default: `book_now`. Petsitting defaults to `inquiry`. Full transitions in [Booking State Machine](./05-booking-state-machine.md#booking-modes).

## Multi-Pet Bookings

A booking may include multiple pets (`booking.petIds[]`). Each pet consumes **one spot** against `fixed_event` capacity or `stay` occupancy. Pricing (per pet vs per booking) is a per-service setting — see [Pets](./19-pets.md#multi-pet-bookings).

## Delivery Modes & Locations

Independently of scheduling type, each service declares one or more **delivery modes** (online / at client's home / at a provider location) and links to organization locations. This drives marketplace search and geo-matching — see [Search](./13-search.md). Date-based availability filtering in search reuses the scheduling-type rules above.
