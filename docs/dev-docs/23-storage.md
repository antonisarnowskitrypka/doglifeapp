# File Storage

Firebase Storage for all uploaded files: avatars, session attachments, equipment docs, pet-event results, invoice PDFs.

## Upload Path (server-authoritative)

Clients never write to Storage directly (see [Firebase & Security](./03-firebase-and-security.md)). Uploads are mediated by Nuxt server routes:

1. Client requests an upload; server validates **type** and **size** and issues a short-lived signed/resumable upload URL (or accepts the bytes via the route).
2. Reads are served via **time-limited signed download URLs** generated server-side.

## Path Layout

```
users/{uid}/avatar.{ext}
pets/{petId}/avatar.{ext}
pets/{petId}/events/{eventId}/{fileId}.{ext}
bookings/{bookingId}/attachments/{fileId}.{ext}
equipment/{equipmentId}/{fileId}.{ext}
invoices/{invoiceId}.pdf
certificates/{certificateId}.pdf
org/{orgId}/policies/{kind}-v{version}.pdf
org/{orgId}/branding/logo.{ext}
org/{orgId}/branding/signature.png
org/{orgId}/staff/{membershipId}/avatar.{ext}
```

## Limits & Types

- **Max file size: 10 MB** per file (enforced in the server route and Storage rules).
- **Allowed types:** images — `image/jpeg`, `image/png`, `image/webp`, `image/heic`; documents — `application/pdf`.
- Reject anything else server-side before issuing the upload URL.

## Image Processing

- A Cloud Function on object finalize generates **resized variants / thumbnails** for images (avatars, progress photos) to keep the UI fast.
- PDFs are stored as-is.

## Attachment Shape

The shared `Attachment` shape (used by equipment, pet events, session workspace) is defined in [Equipment Registry](./11-equipment.md):

```
fileUrl, fileName, contentType, uploadedBy, uploadedAt
```

## Retention

- Files for **soft-deleted** entities are retained by default (consistent with the soft-delete policy in [Conventions](./00-conventions.md)) to preserve invoices and history.
- Hard deletion / purge aligns with GDPR erasure — **parked** (see [Payments](./07-payments.md#parked)).

## Parked

- **Antivirus / malware scanning** on upload — deferred (revisit before opening uploads broadly).
