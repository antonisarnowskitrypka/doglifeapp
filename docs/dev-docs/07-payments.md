# Payments

## Provider

Stripe + Stripe Connect (marketplace model).

## Escrow Flow

```
Customer
  ↓  pays via Stripe Checkout
Stripe (escrow)
  ↓  on `completed` (both confirm, or auto after the 24h window)
Provider's Stripe Connect account
```

Escrow is released when the booking reaches `completed` — either both parties confirm, or no dispute is raised within the 24h confirmation window (auto-release). A `disputed` booking halts release until resolved. See the [completion flow](./05-booking-state-machine.md#service-completion-confirmation-window).

## Currency & VAT

- **One currency per organization** (`organization.currency`); all amounts are integer minor units (see [Conventions](./00-conventions.md)).
- The provider sets a **VAT rate** (`organization.vatRate`); prices are VAT-inclusive and shown with a *"includes X% VAT"* note. VAT is recorded on invoices (see [Provider Business Dashboard](./15-provider-dashboard.md)).

## Platform Fee

The marketplace fee is deducted automatically via the Stripe Connect application fee, calculated on the **discounted** amount (after any promotion/discount code — see [pricing & commission order](./15-provider-dashboard.md#pricing--commission-order)).

The rate is the org's **effective commission**, not a flat number: **7.5%** with no subscription, **4.5%** on the €11/mo Pro subscription, **−1 p.p.** while a referral discount is active, or an absolute **super-admin custom rate**. See the canonical model in [Platform Billing & Subscription](./15-provider-dashboard.md#platform-billing--subscription).

## Payment Types

| Type | Description |
|---|---|
| `stripe` | Online payment via Stripe Checkout |
| `cash` | Recorded manually, no Stripe transaction |
| `custom` | Any other arrangement, recorded manually |

## Manual Bookings

A provider-created manual booking for a **registered** customer can be sent for **Stripe payment** by that customer. When paid via Stripe:

- the **standard effective commission applies** (it's a platform payment via Connect — the org's tier/referral/custom rate, see [Platform Fee](#platform-fee)), and
- funds follow the **normal escrow** flow (held until completion, 24h confirmation window, disputes) — same as a platform booking.

Manual bookings are **fee-free only** when settled **off-platform** (cash / custom). Stripe payment requires a registered customer (guests on a manual booking can't be charged via Stripe).

## Guest Checkout

Customers can complete Stripe Checkout without a platform account. No card details are saved in MVP.

## Webhooks

Stripe webhooks are processed via Nuxt server routes using the Firebase Admin SDK to update booking and payment state in Firestore.

Key events to handle:
- `checkout.session.completed` — payment succeeded → transition booking to `confirmed`
- `payment_intent.payment_failed` — notify customer, revert booking
- `account.updated` (Connect) — provider onboarding status updates

## Cancellation & Refunds

Refunds are issued via Stripe API from the server route handling the cancellation transition.

See [Booking State Machine](./05-booking-state-machine.md) for the cancellation rules.

## Goodwill Refund Requests

When a customer ends up in a **no-refund outcome** — a **late cancellation** (after the free window) or a **`no_show`** — they may attach a **reason** asking the provider to refund anyway as a goodwill gesture (e.g. a family emergency). This is **provider discretion**, entirely separate from [disputes](./27-disputes.md) (which are platform-mediated and only for *completed* services).

**The cancellation/no-show finalizes immediately per policy** — booking goes to `cancelled` / `late_cancelled_consumed` / `no_show`, the slot is released, any package session is consumed as normal (see [Packages](./08-packages.md#session-consumption-logic)). The goodwill request is a **separate side-channel** that does **not** hold the slot or change the booking status; it just lets the provider voluntarily reverse the money/session afterwards.

```
// goodwillRefundRequests
id: string
bookingId: string
organizationId: string
customerId: string
trigger: 'late_cancellation' | 'no_show'
reason: string                  // the customer's plea
status: 'open' | 'granted' | 'declined' | 'expired'
resolution: {
  type: 'refund_full' | 'refund_partial' | 'session_restored' | 'declined' | null
  refundAmountMinor: number | null   // for refund_partial / refund_full (org currency, minor units)
  restoredSession: boolean            // package/course: return the consumed session to the pool
  note: string | null
  decidedBy: string | null            // provider userId (Owner/Staff on that booking)
  decidedAt: timestamp | null
}
expiresAt: timestamp            // provider response window = platformConfig.goodwillRefundWindowDays
createdAt: timestamp
```

- **One open request per booking.** The customer submits it from the booking once it lands in a no-refund state.
- **Provider decision** (Owner, or Staff on their own booking): **full** refund, **partial** refund (any amount ≤ paid), **restore a consumed session** (package/course — `remainingSessions++`, see [Packages](./08-packages.md#session-consumption-logic)), or **decline**. A grant may combine a (partial) refund **and** a session restore.
- Money is refunded via the Stripe API like any other refund; a session restore runs the package transaction in reverse.
- **No response by `expiresAt`** → auto-`expired`, no refund (status quo). The provider is reminded before expiry.
- Both submission and decision notify the other party (see [Notifications](./09-notifications.md)).

## Parked

- **Disputes & chargebacks** — the `disputed` state, Stripe `charge.dispute.*` webhooks, and the resolution workflow are specified in [Super Admin](./24-super-admin.md#disputes--chargebacks).
- **GDPR erasure** — hard deletion / anonymization beyond soft delete remains **deferred** (revisit with data-retention policy).
