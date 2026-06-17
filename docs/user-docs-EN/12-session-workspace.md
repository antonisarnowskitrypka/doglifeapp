# Session Workspace

Every booking has a dedicated session screen, shared by the client and the provider. It's the **BOOKING** tab of the [Booking Detail & History](./13-booking-detail-and-history.md) screen.

## Before the visit

The provider can place instructions for the client before the session (e.g. what to bring, how to prepare the pet).

## Provider notes

The provider records two kinds of content, with different visibility:

- **Private notes** — internal observations. **Always private to the provider**; the client never sees them.
- **Recommendations and progress** — **shared with the client**. This is what appears in the client's view and in the shared history.

Both are **exportable to PDF** (the provider's export includes private notes; the client's export does not).

## Client notes

Private notes visible only to the client. Not shared with the provider.

## Homework

A list of tasks the provider assigns to the client to do between sessions.

The client can enable a **recurring reminder** for the homework and choose the interval (e.g. daily, every 2 days), to remember to practice between sessions. **Off** by default.

Notes, recommendations, and homework can be inserted from [templates](./26-templates.md). Some services/courses fill the session automatically — instructions and materials appear right away, while recommendations and homework wait as "pending" until the provider sends them.

> In a [course](./11-packages.md), besides each lesson's workspace there's also a **workspace for the whole course** — with shared materials and separately kept course-level notes and homework.

## Attachments

Files can be added by either party:
- Photos
- PDFs

Each file can be up to 10 MB (images and PDFs).

Every attachment supports comments.

When a booking is completed, its [invoice](./19-provider-dashboard.md) is generated automatically and added here as an attachment for the client.

> There's no separate chat within a booking. All communication within a booking happens through **comments** on attachments and recommendations. General pre-booking questions go through [chat on the profile](./06-provider-profile.md).

## Online sessions

For online sessions, a **meeting link** appears in the session workspace, visible to both parties — an automatic Google Meet link (when the provider has connected Google) or a link entered manually. See [Google Integration](./17-provider-setup.md).

## Session metrics

A session can collect numeric and text data (e.g. treadmill speed, strength, heart rate) — the fields come from a [session template](./26-templates.md) or are added ad hoc. Metrics are **visible to the client** and compared session-to-session in the [history](./13-booking-detail-and-history.md).

## Timeline

All sessions within a relationship with a provider (or across the whole platform) build a cumulative history of the pet's progress. See also: [Life of Pet](./15-life-of-pet.md).

---

⬅️ **Previous:** [Packages & Courses](./11-packages.md) · **Next:** [Booking Detail & History](./13-booking-detail-and-history.md) ➡️
