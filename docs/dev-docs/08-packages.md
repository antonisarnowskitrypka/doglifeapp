# Packages & Courses

Two distinct products built on the same session-consumption mechanics:

- **Package** — a plain bundle of interchangeable sessions (e.g. *3 massages*). No dedicated public page; sold from the provider profile.
- **Course** — a structured program (e.g. *Grzeczne Czekanie*) with its **own public, indexed page**, an ordered **curriculum of lessons**, and configurable pacing. See [Courses](#courses) below.

## Data Model

### `packageDefinition` (defined by provider)

```
name: string
description: string
sessionCount: number
price: number
currency: string
serviceId: string
organizationId: string
```

### `packagePurchase` (per customer purchase)

```
packageDefinitionId: string
customerId: string
organizationId: string
totalSessions: number
remainingSessions: number
stripePaymentId: string
purchasedAt: timestamp
```

### `booking` fields when linked to a package

```
packagePurchaseId: string
sessionNumber: number          // which session in the package this is (1-based)
```

## Session Consumption Logic

Run in a server route transaction when a booking status changes:

```
completed              → remainingSessions--
late_cancelled_consumed → remainingSessions--
no_show                → remainingSessions--
cancelled (early)      → remainingSessions unchanged
```

The decrement must be atomic — use a Firestore transaction to prevent race conditions when multiple bookings from the same package are processed concurrently.

A granted **[goodwill refund request](./07-payments.md#goodwill-refund-requests)** with `restoredSession: true` runs this in reverse for a `late_cancelled_consumed` / `no_show` booking (`remainingSessions++`), also transactionally.

## Package Purchase Flow

1. Customer selects a package on the provider's profile
2. Stripe Checkout for full package price
3. On `checkout.session.completed`: create `packagePurchase` document with `remainingSessions = totalSessions`
4. Subsequent bookings reference the `packagePurchaseId`

## Courses

A course is a structured product with its own **public, SEO-indexed page** (see [Search: indexing](./13-search.md)).

### `course`

```
id: string
organizationId: string
slug: string                    // indexed public page URL
title: string
shortDescription: string
longDescription: string | null
categoryKey: string             // main category (colour/icon)
level: 1 | 2 | 3 | null         // optional advancement level (1 beginner → 3 advanced); null = unspecified
pacing: 'individual' | 'group'  // who attends
dateMode: 'fixed' | 'self_scheduled'   // how dates are set — independent of pacing
price: number
currency: string
materials: {                    // COURSE-level, authored once, shared to every enrolled participant
  order: number
  kind: 'material' | 'pre_visit'
  title: string
  body: string | null
  attachments: Attachment[]     // intro video, plan PDF, etc.
}[]
lessons: {                      // ordered curriculum
  order: number
  name: string
  date: timestamp | null        // set when dateMode == 'fixed'
  sessionTemplateId: string | null   // each lesson carries its own session template → its OWN lesson materials, metrics
}[]
```

### Pacing × Dates (two independent axes — both chosen per course)

**Pacing** — who attends:
- **`individual`** — one customer (and their pet).
- **`group`** — a shared group; occupancy/capacity per session applies (see [calendar](./06-calendar-and-availability.md)).

**Date mode** — how session dates are set:
- **`fixed`** — all course dates are known up front (e.g. *Psie Przedszkole Wiosna 2026*); `lessons[].date` is populated. Customers enrol into the whole dated series.
- **`self_scheduled`** — the customer books each lesson/session themselves from the calendar at their own pace (package mechanics: `remainingSessions = lessons.length`, each booking maps to a lesson by `order`).

Typical pairings: **group + fixed**, **individual + self_scheduled** — but **all combinations are allowed**; the provider picks both axes for each course.

### Course content: two levels

A course holds content at **two nested levels** — an umbrella **course workspace** above the per-lesson **session workspaces**:

```
Course "Grzeczne Czekanie"
├── Course materials (shared)         intro, plan, intro video        ← course.materials[]
├── Course notes + homework (per participant)                         ← courseWorkspace
└── Lessons (each is a full session, own materials)
    ├── Lesson 1 "Legowisko"          own materials, metrics, notes…  ← booking session workspace
    ├── Lesson 2 …
    └── …
```

**1. Course materials — authored, shared.** `course.materials[]` is authored once and is **identical for every enrolled participant** (intro, plan, intro video). Visible **immediately on enrollment**. Same instantiation gate as elsewhere: `material` / `pre_visit` show immediately (no `pending` state — these are shared, not per-person).

**2. Course workspace — per participant.** A `courseWorkspace` doc spans the whole enrollment and holds the **per-participant** course-level content: private provider notes and course-wide recommendations/homework. **Per participant even in group courses** (each participant + their pet gets their own) — only `course.materials[]` is shared across the cohort.

```
// courseWorkspace — one per (course, participant)
id: string
courseId: string
organizationId: string
customerId: string
enrollmentId: string                  // packagePurchase / cohort enrollment ref
items: {
  kind: 'note' | 'recommendation' | 'homework'
  body: string
  status: 'pending' | 'sent'          // notes are provider-only; recommendation/homework gated pending→sent
  attachments: Attachment[]
  createdAt: timestamp
}[]
```

Course-level `recommendation`/`homework` follow the same **`pending` → `sent`** visibility gate as the [session workspace](../user-docs/12-session-workspace.md) (notes stay provider-only). The course-wide homework can also drive the opt-in [homework reminder](./09-notifications.md).

**3. Lesson sessions.** Each lesson is a full session with its **own** workspace and its **own** materials, driven by the lesson's `sessionTemplateId` (see [Templates](./29-templates.md)) — instantiated into the lesson's booking, with per-booking notes, recommendations, homework and metrics. This is the existing session mechanic, unchanged.

### Lesson unlocking (sequential)

Course materials are available immediately; **lessons unlock in order**:

- **`dateMode: 'fixed'`** → a lesson and its materials unlock on/around its `lessons[].date` (the cohort moves together).
- **`dateMode: 'self_scheduled'`** → lesson *N* unlocks once lesson *N-1* is **completed** (`remainingSessions` / lesson `order` progress — see [Session Consumption](#session-consumption-logic)).

Unlock state is derived from dates + completion progress, not stored separately.

### Guest leaders

A course or group event can have a **guest leader** — an outside instructor (e.g. another trainer) invited to co-run *that one event only*. They do **not** become org staff (`organizationMembers` is untouched, no payouts, no org-wide access); they get a **staff-equivalent grant scoped to the single event**.

```
// eventGuestLeaders  — one grant per (scope, scopeId, userId)
id: string
scope: 'course' | 'event'       // course = whole curriculum; event = a single fixed_event
scopeId: string                 // courseId or fixed_event id
organizationId: string          // host org
userId: string                  // the guest's account — invited by account (every staff/leader has one)
invitedBy: string               // owner userId
status: 'invited' | 'active' | 'revoked'
publicCoLeader: boolean         // shown on the public course/event page as co-leader (default true)
createdAt: timestamp
revokedAt: timestamp | null
```

- **Invited by account** — the owner invites an existing user; the grant attaches to their `userId`. (Only the **Owner** can invite/revoke — see [Permissions Matrix](./22-permissions-matrix.md).)
- **Access while `active`** is exactly staff-like **but fenced to the event**: they read/write the [group-event chat](./12-provider-profile-and-chat.md#group-event-chat) (as a `staff` participant), use the [session workspace](./12-provider-profile-and-chat.md) for that event's sessions (notes, recommendations, **uploading materials**), and see the enrolled **participants and their pets** (handling answers, conditions/contraindications) — within this event. They see nothing else: no other bookings, no finances, no org settings.
- **Public** — when `publicCoLeader`, the guest appears on the course/event page as a co-leader.
- **Revoke** — `status: 'revoked'` cuts access immediately, the same way removing staff does, but only for this event.
- **Reviewable** — the guest leader can be rated **separately** from the host org (see [Reviews](./16-reviews.md#subject-organization-vs-guest-leader)); that rating lands on the guest's own person-level reputation, never on the host org's average.

### Completion & certificate

Finishing a course (all lessons done / cohort ended) auto-issues a [certificate](./32-certificates.md).

Plain **packages** have no public page, no lessons, and no certificate by default — they're just session bundles.
