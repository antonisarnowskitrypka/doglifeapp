# Templates

Two kinds of provider templates: reusable **content templates** (note / recommendation snippets) applied manually, and **service/lesson templates** that auto-populate a booking's session workspace.

## Content Templates

Reusable building blocks the provider inserts manually in the [Session Workspace](../user-docs/12-session-workspace.md).

### `contentTemplates`

```
id: string
organizationId: string
createdBy: string
kind: 'note' | 'recommendation' | 'homework' | 'pre_visit' | 'material'
title: string
body: string                    // text; for 'material', plus attachment refs
createdAt: timestamp
```

A provider can keep several per kind (e.g. multiple note templates, multiple recommendation templates) and pick one when filling a session.

## Service / Lesson Templates

Bound to a **service** or a **package/course**, these auto-set up the session on booking — e.g. the *Konsultacja* service always ships pre-visit prep instructions, while the *Grzeczne Czekanie* course ships learning materials right after purchase.

### Entry point: "Schemat sesji" (per service)

Each service row on [`/provider/services`](./35-pages-and-routes.md) carries two distinct configuration actions, kept separate on purpose:

- **"Edytuj formularz"** → the **pre-booking** intake (required handling fields + custom questions) — see [Pets → Handling Questions](./19-pets.md#handling-questions).
- **"Schemat sesji"** → this **post-booking** session template. It **predefines the "Session" object** that is instantiated after a booking is made: **pre-visit instructions** (`pre_visit`), **materials** (`material`), and a **template of recommendations / session data / homework** (`recommendation`, `homework`, plus the [metric fields](#session-metric-fields) for structured "data"). It is the provider's reusable blueprint for what every session of that service should contain.

The provider edits one `serviceTemplates` doc per service here; it instantiates per the [trigger](#instantiation-trigger) below into each booking's [session workspace](../user-docs/12-session-workspace.md). **Status:** planned — the "Schemat sesji" button currently ships **disabled** on the services screen until this editor is built.

### `serviceTemplates`

```
id: string
organizationId: string
appliesTo: { serviceId: string | null, packageId: string | null }
items: {
  kind: 'pre_visit' | 'material' | 'recommendation' | 'homework'
  contentTemplateId: string | null   // reference a content template, or inline payload
  body: string | null
  attachments: Attachment[]           // for 'material'
}[]
createdAt: timestamp
```

### Instantiation trigger

- **Service booking** → items instantiate into the booking's session workspace when the booking reaches **`confirmed`** (see [Booking State Machine](./05-booking-state-machine.md)).
- **Package** → items instantiate **on purchase**.
- **Course** → a course is two-level (see [Courses: course content](./08-packages.md#course-content-two-levels)): **shared course materials** are authored directly on `course.materials[]` (not a template), while each **lesson's** own materials/metrics come from that lesson's `sessionTemplateId`, instantiated into the lesson booking like any session.

### Session metric fields

A session template can also define **metric fields** collected each session — numeric or string — especially for physio (treadmill speed, strength, heart rate, …):

```
// on serviceTemplates
metrics: {
  key: string            // stable, e.g. 'treadmill_speed'
  label: string          // localized display
  type: 'number' | 'string'
  unit: string | null    // for numeric, e.g. 'km/h', 'bpm'
}[]
```

- The provider may also add an **ad-hoc** metric field directly in a session (not in the template) for a one-off measurement.
- Collected values live on the session workspace (see [Client History & Sharing](./14-client-history-and-sharing.md#session-metrics)) and are **always visible to the customer** (progress data).

### Visibility on instantiation (per item kind)

| Item kind | Customer sees it… |
|---|---|
| `pre_visit` (instructions) | **Immediately** |
| `material` (files/links) | **Immediately** |
| `recommendation` | **After the provider manually sends it** — created with `status: 'pending'`, provider-only, until the provider clicks send (`status: 'sent'`) |
| `homework` | **After the provider manually sends it** — same `pending` → `sent` gate |

This mirrors the manual session workspace: `recommendation` and `homework` items carry `status: 'pending' | 'sent'`; only `sent` items are visible to the customer. `pre_visit` and `material` need no gate.

## Notes

- Content/material attachments follow [Storage](./23-storage.md) rules.
- Recommendation visibility is consistent with [Client History & Sharing](./14-client-history-and-sharing.md) (recommendations are the customer-visible class of provider content; private notes remain provider-only regardless of templates).
