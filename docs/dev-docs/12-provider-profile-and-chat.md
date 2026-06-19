# Provider Profile & Chat

## Public Profile

The public, SEO-indexed provider page is organised into three tabs:

| Tab | Content | Source |
|---|---|---|
| SERVICES | List of services, each linking into the booking flow | `services` for the org |
| ABOUT | Company details, description, reviews, certificates, public equipment, location static map | org profile, `reviews`, public `equipment`, `location` |
| CHAT | General pre-booking client–provider conversation | `conversations` (see below) |

SERVICES and ABOUT are server-rendered for SEO. CHAT is interactive (auth-gated for sending).

### Organization profile fields

Editable by the **Owner** (see [Permissions](./22-permissions-matrix.md)). On the `organizations` doc:

```
name: string
slug: string                    // public URL (/p/{slug})
description: string | null      // shown on the ABOUT tab
logoUrl: string | null          // org/{orgId}/branding/logo.{ext} (see Storage)
categoryKeys: string[]          // main categories (see Service Categories)
acceptedSpecies: string[]       // 'dog' | 'cat'
companyDetails: { name, taxId, address } | null   // legal/invoice details
status: 'draft' | 'active' | 'suspended'
timezone: string
ownerId: string
```

A staff member's public presentation comes from their `organizationMembers` blurb (`shortDescription`/`longDescription`), `languages`, and org-scoped `avatarUrl` (falling back to the person's `users.avatarUrl`) — see [Accounts & Membership](./20-accounts-and-membership.md).

The operational **location** (a geocoded address, distinct from the invoice `companyDetails.address`) is specified in [Geocoding & Maps](./36-geocoding-and-maps.md). The ABOUT tab renders that location's **static map**: an exact pin for public business locations, an **approximate-area** map (exact address hidden) for home-based providers (`location.isPublic == false`).

## Chat Model

There are **two** chat surfaces: the profile-level customer↔organization conversation (below), and a **group-event conversation** for group events (further below). There is **no per-booking chat** — in-booking communication uses comments on session attachments/recommendations instead.

### `conversations`

```
id: string
organizationId: string
customerId: string             // the customer who started it
createdAt: timestamp
lastMessageAt: timestamp
```

A conversation is keyed by `(organizationId, customerId)` — one thread per customer↔org pair.

### `messages` (subcollection of `conversations`)

```
id: string
conversationId: string
senderId: string
senderRole: 'customer' | 'staff'
body: string
createdAt: timestamp
readAt: timestamp | null
```

## Behaviour

- The conversation is with the **organization**, not a specific staff member. Any Owner/Staff member can read and reply.
- Conversations persist; once a customer books, the prior chat remains available as context for the provider.
- Sending a message triggers a notification to the other party (see [Notifications](./09-notifications.md) — "new profile chat message").
- All writes go through Nuxt server routes; the frontend may use an auth-scoped real-time subscription for live message display.

## Visit Proposal (in chat)

In the customer↔org profile chat, the provider has a visible **"Propose a visit"** action. It produces a proposal card — **this is not a booking** (no pet, handling answers, or terms yet); it's a **prefilled shortcut** into the booking flow that the customer can open or dismiss.

### Proposal message

A `conversations` message of kind `visit_proposal`:

```
kind: 'text' | 'visit_proposal'
proposal: {                      // when kind == 'visit_proposal'
  serviceId: string
  start: timestamp
  end: timestamp
  deliveryMode: 'online' | 'at_client' | 'at_location'
  locationId: string | null
  price: number                  // defaults to the service/mode price; provider may edit before sending
  status: 'open' | 'accepted' | 'dismissed'
}
```

### Behaviour

- **Price**: defaults to the standard service price for the chosen delivery mode; an edit affordance lets the provider set a custom price before sending (like a mini-quote).
- **Accept** → opens the booking flow **prefilled** (service, date/time, mode, price). Because the provider initiated it, the booking is **pre-approved** — but "pre-approved" only skips the provider's confirmation step. **All standard [booking prerequisites](./05-booking-state-machine.md#booking-prerequisites) still apply**: the customer must select the pet, answer the service's **required handling questions** (aggression, attitude to other animals, etc.), and accept the provider's terms — then **pays directly**, skipping `awaiting_provider_confirmation` even if the service is normally `request`/`inquiry`. The proposal price overrides as the base price.
- **Dismiss** → the customer removes the card; the provider can also delete it.
- **No slot hold, no expiry** — the slot is not reserved; the proposal stays until the provider removes it or the slot is no longer available (then it's no longer actionable). First to actually book and pay wins.

## Group-Event Chat

A group event (a `fixed_event` — see [Calendar & Availability](./06-calendar-and-availability.md)) has its own conversation giving context to **all enrolled participants** plus the provider. Each occurrence of a [recurring series](./06-calendar-and-availability.md#recurring-event-series) is a separate `fixed_event`, so each gets its **own independent thread** (keyed by `eventId`).

### `eventConversations`

```
id: string
eventId: string
organizationId: string
createdAt: timestamp
writableUntil: timestamp        // event end + 7 days — writable for wrap-up, then read-only
expiresAt: timestamp            // event end + 30 days — TTL auto-delete
status: 'active' | 'archived'
```

### `eventConversations/{id}/participants`

```
userId: string
role: 'customer' | 'staff'
mode: 'everyone' | 'provider_only'   // customer's thread-level routing setting (default 'everyone')
```

### `eventConversations/{id}/messages`

```
id: string
senderId: string
senderRole: 'customer' | 'staff'
body: string
createdAt: timestamp
```

The event thread carries **only group ('everyone') messages** — there is no per-message audience here, because 1:1 traffic is routed to the profile conversation (below).

### Behaviour

- **Membership = current enrollment.** Participants are the customers enrolled in the event plus the org's staff **and any active [guest leaders](./08-packages.md#guest-leaders)** (who join as `role: 'staff'` participants, scoped to this event). Cancelling enrollment — or revoking a guest leader's grant — **revokes access** to the thread.
- **Client thread mode** (`participant.mode`, a **thread-level setting**) decides routing:
  - `everyone` → the message is posted to the **group event thread**.
  - `provider_only` → the message is routed to the existing **profile `conversations`** thread (customer↔org), *not* the event thread.
- **Provider mode**: the provider can post to the whole group, or message **any individual member 1:1** — that 1:1 also goes through the **profile `conversations`** thread.
- **All 1:1 customer↔org traffic consolidates in the single profile conversation**, whether the provider DMs a member or a customer writes in `provider_only` mode. The event thread stays purely the group context.
- **Lifecycle**: read/write while the event is upcoming/active and the user is enrolled; after the event ends, the thread stays **writable for 7 days** (`writableUntil`) for wrap-up, then becomes read-only; a TTL deletes it ~30 days after the event (`expiresAt`). The profile conversation is unaffected by this TTL.
- Writes go through server routes; notifications follow [Notifications](./09-notifications.md).
