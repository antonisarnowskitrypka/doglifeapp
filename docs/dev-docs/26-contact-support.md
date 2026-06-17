# Contact Support

In-app support tickets (questions / problems / bugs), triaged in the super-admin queue.

## `supportTickets`

```
id: string
userId: string | null           // null for guest; identify by email
email: string
category: 'question' | 'problem' | 'bug'
subject: string
description: string
attachments: Attachment[]        // shared Attachment shape; 10 MB, images/PDF (see Storage)
status: 'open' | 'in_progress' | 'resolved'
assignedTo: string | null        // super-admin userId
createdAt: timestamp
updatedAt: timestamp
```

### `supportTickets/{id}/replies` (subcollection)

```
id: string
authorId: string                 // user or super-admin
authorRole: 'user' | 'admin'
body: string
attachments: Attachment[]
createdAt: timestamp
```

## Flow

1. User submits a ticket via a Nuxt server route (validates category, size/type of attachments).
2. Ticket appears in the **super-admin support queue** (see [Super Admin](./24-super-admin.md)).
3. Admin replies / changes `status`; the user is notified (in-app + email, per their [preferences](./09-notifications.md)).

## Notes

- Distinct from booking [disputes](./27-disputes.md) — support is general, not tied to escrow/payment.
- Attachments follow [Storage](./23-storage.md) rules (server-mediated upload, 10 MB, images/PDF).
