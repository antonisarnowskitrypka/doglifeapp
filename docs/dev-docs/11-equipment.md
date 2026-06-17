# Equipment Registry

Lets a provider track equipment, servicing history, and inspection reminders. Scoped to an organization.

## Data Model

### `equipment`

```
id: string
organizationId: string
name: string
description: string
isPublic: boolean              // the "eye" toggle — shown on the public profile
acquiredAt: timestamp | null
nextInspectionAt: timestamp | null   // drives the in-app reminder
attachments: Attachment[]      // invoices, certificates, photos
createdAt: timestamp
updatedAt: timestamp
```

### `equipmentServiceLog` (subcollection of `equipment`)

```
id: string
equipmentId: string
servicedAt: timestamp
description: string
cost: number | null
attachments: Attachment[]      // service protocol, invoice
createdAt: timestamp
```

### `Attachment` (shared shape)

```
fileUrl: string                // Firebase Storage path
fileName: string
contentType: string
uploadedBy: string             // userId
uploadedAt: timestamp
```

## Public Visibility

`isPublic` controls whether the item appears on the provider's public profile (ABOUT or a dedicated section). Defaults to `false`. Toggling is an Owner/Staff action via a server route.

### Feeds search tags

Names of **public** equipment items contribute to the organization's **search tokens**, strengthening discovery (e.g. a public "water treadmill" / "bieżnia wodna" makes the provider findable by that term). These tokens are denormalized into each service's searchable `tags[]` (see [Search](./13-search.md)); recompute whenever an item is added/removed or its `isPublic` toggles. Private (hidden) items never feed search.

## Reminders

A scheduled Cloud Function scans `equipment.nextInspectionAt` and emits an **in-app** notification to the organization when an inspection/maintenance date approaches. No push/email in MVP for this event (see [Notifications](./09-notifications.md)).

## Access

- All reads/writes go through Nuxt server routes (Owner/Staff of the organization).
- Public profile reads expose only `isPublic === true` items, with internal fields stripped.
- File uploads go to Firebase Storage via server-issued upload paths.
