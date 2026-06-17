# Reviews

Customer → provider reviews, created after a completed booking. One-directional in MVP (no provider→customer reviews).

## Model

### `reviews`

```
id: string
organizationId: string
bookingId: string               // the completed booking being reviewed
customerId: string
subject: 'organization' | 'guest_leader'   // what this review rates (see below)
staffUserId: string | null      // userId of the staff member / guest leader who delivered the service —
                                // the person-level identity that carries reputation across orgs.
                                // REQUIRED when subject == 'guest_leader'; optional for 'organization'.
rating: number                  // overall, 1–5
tags: string[]                  // selected from the predefined highlight pool
text: string | null             // optional free text (public, on profile)
privateFeedback: string | null  // visible ONLY to the provider — never on the public profile/aggregates
confirmed: boolean              // true if the booking was a platform (paid) booking
kind: 'standard' | 'loyalty'    // loyalty = the post-threshold higher-weight review
weight: number                  // 1 for standard; > 1 for loyalty (platform-configured)
createdAt: timestamp
```

## Rules

- Created only by the `customerId` of a `completed` booking. Uniqueness is per **(bookingId, subject, staffUserId)** — so one organization review *and* one review per guest leader can coexist for the same booking.
- `confirmed = booking.source === 'platform'`. Manual bookings produce reviews without the badge.
- `rating` is required; `tags`, `text`, and `privateFeedback` are optional.
- **`privateFeedback`** is delivered to the provider only — excluded from the public profile and from all public aggregates.

## Subject: organization vs guest leader

`subject` decides whose reputation a review feeds:

- **`organization`** (default) — rates the booking/event experience. Feeds the **organization** aggregate. If `staffUserId` is set (a staff member delivered it), it **also** feeds that person's aggregate.
- **`guest_leader`** — rates an outside [guest leader](./08-packages.md#guest-leaders) who co-ran the event. `staffUserId` is the guest's userId. Feeds **only that person's** aggregate — **never** the host org's average (the org doesn't own an outside leader's reputation).

When an event has a guest leader, the customer is prompted for **two separate reviews** — one for the event/firm (`organization`) and one for the guest (`guest_leader`); each is independent and optional. Guest-leader reviews are always `kind: 'standard'`, `weight: 1` (the [loyalty review](#loyalty-review) applies to the customer↔org relationship only).

## Highlight Tags

A predefined pool (platform-managed, localisable), e.g. `great_specialist`, `good_location`, `friendly`, `punctual`, `clean_space`. Stored as stable keys; display strings are translated client-side. The pool is curated centrally — providers do not define their own.

## Loyalty Review

After a customer completes **X services** with the same provider (`platformConfig.loyaltyReviewThreshold`, default **3** — see [Super Admin](./24-super-admin.md)), a **one-time** higher-weight review unlocks (`kind: 'loyalty'`, `weight > 1`).

- One-time per customer↔org once the threshold is crossed (not repeated).
- Its higher `weight` counts more in **both** the provider's rating average **and** marketplace ranking (see [Search](./13-search.md)).

## Two-level aggregation (organization + person)

Every review feeds **two** independent aggregates:

1. **Organization rating** — all reviews with this `organizationId` **and `subject === 'organization'`**. Shown on the provider profile (ABOUT tab) and is the **only rating that feeds marketplace ranking** (see [Search](./13-search.md)). Guest-leader reviews are excluded.
2. **Person rating** — all reviews with this `staffUserId` (**either subject**), **across every organization** the person has worked at or guest-led for. Reputation attaches to the *individual*, so it follows them when they join a second firm, change firms, or guest-lead elsewhere. Does **not** affect marketplace ranking — discovery is org-level.

Because the carrier is the staff member's **userId**, a staff invite must resolve to (or create) a user account before that person can be credited on reviews. A review with `staffUserId === null` (org-level service, no named staff) feeds only the organization aggregate.

### What the profile shows

Organization profile (ABOUT tab):

- **Weighted** average `rating` (Σ rating·weight ÷ Σ weight) and review count for the organization.
- Top highlight tags by frequency.
- Individual reviews, with the Confirmed badge where `confirmed === true`.

Per specialist (on the staff member's card / detail):

- Their **personal weighted average** and review count, pooled across all orgs.
- Individual reviews. A review whose `organizationId` differs from the org currently being viewed is **visibly marked** (e.g. "u innego usługodawcy" / "at another provider") — the score merges, but the source is never hidden.
- **`privateFeedback` is never shown** in either view — provider-only.

### Computation

Org aggregates can be computed on read in MVP, or maintained as counters on the organization doc if read volume warrants. Person aggregates are queried by `staffUserId` across orgs (a composite index on `staffUserId` + `weight`), or likewise denormalized onto the user/specialist doc later. No migration needed — `staffUserId` is captured on every review from day one.

Review creation also emits a `review_received` [analytics event](./34-analytics-and-insights.md); the weighted-rating and Confirmed-ratio signals here feed the provider **trust score** (a private analytics insight — no schema change to reviews).

## Lifecycle

1. Booking reaches the completion confirmation window / `completed`.
2. **Immediate path:** if the customer **manually confirms** the session ("Confirm session") instead of waiting for the 24h auto-complete, they can submit the review **right away**.
3. **Auto path:** otherwise a review-request notification fires 24h after `completed` (see [Notifications](./09-notifications.md)).
4. Customer submits via a Nuxt server route (validates booking ownership, completed status, and no existing review for that subject).
5. Standard reviews and any `privateFeedback` post; the loyalty review is offered once the threshold is met.
6. If the booking's event had a guest leader, the customer is also offered the separate `guest_leader` review.
