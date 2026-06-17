# Certificates

PDF certificates auto-issued for **events** and **courses (packages)**, rendered on a platform-predefined background.

## Trigger (auto on completion)

- **Event** (`fixed_event`) → generated for each enrolled participant once the event has ended (booking `completed`).
- **Course** → generated once finished — all lessons completed (`self_scheduled`) or the dated series has ended (`fixed`); see [Packages & Courses](./08-packages.md#courses).

Issued automatically; the customer is notified and the PDF is delivered (attachment + available in their records).

## Template & fields (MVP)

A **platform-predefined background** with fixed slots:

- Participant — **owner + pet** name (e.g. "Jan Kowalski with Lanza")
- Course / event name
- School (organization name)
- Organization logo
- Date issued
- Provider signature (uploaded PNG)

The provider configures, in settings (stored on the organization):

```
organization.logoUrl: string | null
organization.signatureUrl: string | null   // PNG signature
```

## `certificates`

```
id: string
organizationId: string
type: 'event' | 'course'
sourceId: string            // eventId or course enrollment/purchase id (see Packages & Courses)
customerId: string
petId: string
ownerName: string           // snapshot at issue
petName: string             // snapshot
title: string               // course/event name snapshot
issuedAt: timestamp
pdfUrl: string              // Firebase Storage
```

Party/title fields are **snapshotted** at issue time. PDFs follow [Storage](./23-storage.md) rules.

## After MVP

- **Custom certificates** — provider-designed templates/layouts (beyond the single platform background). Parked.

## Notes

- Generation runs server-side (Cloud Function / server route) on the completion trigger.
- Background layout (slot positions, fonts) is a UI/asset concern — see [UI notes](../ui-notes.md).
