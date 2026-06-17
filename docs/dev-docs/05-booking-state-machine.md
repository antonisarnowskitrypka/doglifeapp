# Booking State Machine

## Statuses

Flow depends on the service's booking mode (`book_now` / `request` / `inquiry` — see Booking Modes below):

```
book_now:  pick slot → awaiting_payment → (pay) → confirmed → … → completed
request:   pick slot → (pay) → awaiting_provider_confirmation → confirmed → … → completed
inquiry:   inquiry → pending → quoted → awaiting_payment → (pay) → confirmed → … → completed
```

Full status list:

| Status | Description |
|---|---|
| `draft` | Started but not submitted |
| `pending` | Submitted, awaiting provider action |
| `quoted` | Provider issued a quote (inquiry mode only) |
| `price_adjustment_requested` | Provider requested a higher price; awaiting customer decision |
| `awaiting_payment` | Awaiting customer payment |
| `awaiting_provider_confirmation` | REQUEST mode: paid, awaiting provider approval within 24h |
| `reschedule_proposed` | REQUEST mode: provider proposed a new time; awaiting customer accept/decline |
| `confirmed` | Payment received, booking is active |
| `awaiting_confirmation` | Service time passed; 24h window for both parties to confirm or dispute |
| `completed` | Service confirmed (by both or auto after 24h); escrow released |
| `disputed` | One party disputed during the confirmation window (escalates — see parked disputes) |
| `cancelled` | Cancelled by customer or provider |
| `late_cancelled_consumed` | Cancelled outside free window — session consumed |
| `no_show` | Customer did not appear |

## Service Completion (confirmation window)

After the service end time, a booking enters a **24-hour confirmation window**:

```
confirmed → (service end) → awaiting_confirmation
   ├─ both parties confirm        → completed (early)
   ├─ neither disputes for 24h    → completed (auto-release)
   └─ either party disputes       → disputed
```

- **Either side can confirm or dispute.** If both confirm, completion is immediate.
- If **no dispute** is raised within 24h, the booking **auto-completes** and escrow is **automatically released** to the provider (see [Payments](./07-payments.md)).
- A **dispute** halts the auto-release and routes to resolution (platform/super-admin — parked, see [Payments](./07-payments.md#parked)).
- On `completed`: escrow release, invoice generation + delivery, review request scheduling (24h later), and package decrement all fire.

## Booking Prerequisites

Before a booking can be created (`pending`/`confirmed`), creation routes validate:

- The organization is published (`status: 'active'`) — `draft`/`suspended` orgs cannot receive bookings (see [Accounts & Membership](./20-accounts-and-membership.md)).
- The customer is not under an active ban with the organization (see [Banning a Client](./17-client-ban.md)).
- Every pet in `petIds` has `status: 'active'` (not deceased/deleted) — see [Pets](./19-pets.md).
- All `service.requiredPetQuestions` are answered for each pet (collected and persisted to `pets.handling` if missing).
- The customer has accepted the provider's current terms & GDPR version (see [Provider Terms & GDPR](./21-terms-and-gdpr.md)).
- If `service.requirePhone` is set, a phone number is provided — including for **guest** bookings (guests otherwise need no phone; see [Accounts & Membership](./20-accounts-and-membership.md)).
- If `organization.requireRegistration` is `true`, **guest bookings are rejected** — the customer must have a registered account. Default is `false` (guests allowed).

## Booking Modes

A service is set to one of three modes (provider's choice per service; this supersedes the former auto-accept toggle):

| Mode | Flow |
|---|---|
| `book_now` | Instant: pick slot → pay → `confirmed`. **Default.** |
| `request` | Pick slot → pay → `awaiting_provider_confirmation` (24h provider window). |
| `inquiry` | No fixed slot: submit inquiry → `pending` → provider `quoted` (with deadline) → pay → `confirmed`. **Default for petsitting.** |

**Provider-initiated visit proposals** (from chat — see [Provider Profile & Chat](./12-provider-profile-and-chat.md#visit-proposal-in-chat)) are **pre-approved**: accepting one goes straight to `awaiting_payment` → `confirmed` on payment, bypassing `awaiting_provider_confirmation` even for `request`/`inquiry` services. This skips only the provider-confirmation step — the [booking prerequisites](#booking-prerequisites) (pet selection, required handling questions, terms acceptance) still apply before payment. The proposal's price is the base price.

### REQUEST mode flow

```
pick slot + pay → awaiting_provider_confirmation        (24h timer)
   ├─ provider approves            → confirmed
   ├─ provider proposes new time   → reschedule_proposed
   │      ├─ customer accepts       → confirmed (new time)
   │      └─ customer declines      → cancelled + full refund
   ├─ provider cancels             → cancelled + full refund
   └─ 24h elapse, no action        → cancelled + full refund (auto, scheduled job)
```

- Payment is captured up front and held in escrow during the 24h window.
- **Only one reschedule is possible**: the provider may propose a new time exactly once (`rescheduleProposalUsed` flag). If the customer declines it, the booking is cancelled with a full refund — there is no second bounce. Further negotiation happens in [chat](./12-provider-profile-and-chat.md), not by re-bouncing the booking.

## Quotes (inquiry mode)

- No negotiation. The provider issues one quote with a **decision deadline** (`quote.expiresAt`, provider-set).
- `quoted` → `awaiting_payment` on customer acceptance.
- If unpaid by `expiresAt`, a scheduled job transitions the booking to `cancelled` automatically.

## Customer Reschedule

Governed by the service's refund policy window (see below):

- **Within the free window** → behaves like a normal change: auto-applied if the service is `book_now`, otherwise provider confirmation required.
- **In the paid window** → provider's discretion whether to allow it.

## Booking Sources

| Source | Description |
|---|---|
| `platform` | Booked via the marketplace UI |
| `manual` | Created manually by the provider |

Manual bookings settled off-platform (cash/custom) skip the payment flow and incur no fee. A manual booking for a **registered** customer may instead be sent for **Stripe payment** — then it runs the normal `awaiting_payment` → `confirmed` flow with escrow and the standard effective commission (see [Payments](./07-payments.md#manual-bookings)).

## Provider Booking Management

After a booking is received, the provider can act on it via server-route action endpoints:

- **Reschedule** — update `startDatetime` / `endDatetime`. Allowed on `confirmed`. Fires a "booking time changed" notification.
- **Cancel** — provider cancellation, full refund (see below).
- **Request price increase** — see below.

## Price Adjustment

The provider can request a higher price than the customer originally selected (wrong product chosen, or attempted underpayment).

State transitions:

```
pending | quoted | confirmed
        ↓ provider requests new price
price_adjustment_requested
        ↓ customer accepts            ↓ customer declines
charge difference                  cancel (full refund of original, no penalty)
        ↓
confirmed (continues)
```

Key points:
- Available from `pending` / `quoted` (pre-confirmation) **and** from `confirmed`.
- Works on `confirmed` because the payment is held in escrow until the service is completed — the captured amount can still be increased up to that point.
- The booking stores the original price and the requested price for audit; on acceptance the delta is charged via Stripe.
- Declining returns the booking to its prior state or allows penalty-free cancellation.

## Cancellation Rules

Evaluated against the service's cancellation policy at the time of the booking:

| Policy | Free window |
|---|---|
| `flexible` | 24 hours before start |
| `standard` | 48 hours before start |
| `strict` | 72 hours before start |

If cancelled within the free window: `confirmed` → `cancelled` + full refund.
If cancelled outside the free window: `confirmed` → `late_cancelled_consumed` + no refund.

In a no-refund outcome (`late_cancelled_consumed` or `no_show`), the customer may attach a reason and submit a **[goodwill refund request](./07-payments.md#goodwill-refund-requests)** asking the provider to refund anyway. This is a side-channel at the provider's discretion — it does **not** hold the slot or change the booking status; the cancellation finalizes immediately and the provider may later grant a full/partial refund and/or restore a consumed session.

## Package Interaction

When a booking is linked to a package purchase:
- `completed` → `remainingSessions--`
- `late_cancelled_consumed` → `remainingSessions--`
- `no_show` → `remainingSessions--`
- `cancelled` (early, within window) → session returned, `remainingSessions` unchanged
