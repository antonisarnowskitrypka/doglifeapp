# Booking Lifecycle

## Statuses

| Status | Description |
|---|---|
| `Draft` | Booking started but not submitted |
| `Pending` | Submitted, awaiting provider action |
| `Quoted` | Provider sent a quote (INQUIRY mode) |
| `Price Adjustment Requested` | Provider requested a higher price; awaiting client decision |
| `Awaiting Payment` | Quote accepted, awaiting payment |
| `Awaiting Provider Confirmation` | REQUEST mode: paid, awaiting provider confirmation (24h) |
| `Reschedule Proposed` | REQUEST mode: provider proposed a different time; awaiting client decision |
| `Confirmed` | Payment received, booking active |
| `Awaiting Confirmation` | Service time has passed; 24h for both parties to confirm or dispute |
| `Completed` | Service confirmed; payment released to the provider |
| `Disputed` | One party raised a dispute within the confirmation window |
| `Cancelled` | Cancelled by the client or provider |
| `Late Cancelled Consumed` | Cancelled after the free window — the session is forfeited from the package |
| `No Show` | The client didn't show up |

## Booking modes

The mode is set by the provider per service (see [Provider Setup](./17-provider-setup.md)):

- **BOOK_NOW** — pick a slot → payment → immediately `Confirmed`.
- **REQUEST** — pick a slot → payment → `Awaiting Provider Confirmation` (24h). The provider approves (`Confirmed`), proposes a different time (`Reschedule Proposed`), or cancels (full refund). No response within 24h → automatic cancellation + full refund.
- **INQUIRY** — inquiry → `Quoted` (quote with a deadline) → payment → `Confirmed`.

### REQUEST mode — proposing a different time

When the provider proposes a different time, the booking goes back to the client (`Reschedule Proposed`):

- The client **accepts** → `Confirmed` (new time).
- The client **rejects** → cancellation + full refund.

Only **one** such change is possible — so the booking doesn't bounce back and forth forever. Further arrangements happen in chat, not through more time proposals.

## Provider editing a booking

Once a booking has been received, the provider can manage it:

- **Reschedule** — move the booking to a different time. The client is notified.
- **Cancel** — cancel the booking (full refund, recorded in the provider's history — see below).
- **Request a price increase** — see below.

### Price increase request

If the client picked the wrong service/product (by mistake or to pay less), the provider can request a higher price instead of cancelling.

Flow:
1. The provider enters a new price with a short justification
2. The client is notified and reviews the adjusted price
3. The client **accepts** → the difference is charged → the booking continues
4. The client **rejects** → the booking can be cancelled without penalty (full refund of the original amount)

This is available both **before** confirmation (the inquiry/quote stage) and on an already **confirmed** booking — the payment is held in escrow until the service is performed, so the amount can be adjusted up to that point.

## Confirming the service was performed

After the service time has passed, there's a **24-hour window** in which both the client and the provider can confirm that the service took place — or dispute it.

- If **both parties confirm**, the booking closes right away.
- If **no one disputes** within 24h, it closes automatically and the payment is released to the provider.
- If **either party disputes**, the payment is held and the matter goes to resolution.

## Reschedule by the client

The client can request to move a booking, following the same refund policy windows:

- **Within the free window** — treated as a normal change. If the service is in BOOK_NOW mode, it happens automatically; in other modes the provider approves the new time.
- **In the paid window** (after the free window) — **it's up to the provider** whether to agree to the reschedule.

## Cancellation by the client

The provider sets the cancellation policy for each service:

| Policy | Free cancellation window |
|---|---|
| Flexible | Up to 24 hours before |
| Standard | Up to 48 hours before |
| Strict | Up to 72 hours before |

Cancelling within the free window means a full refund.
Cancelling after the deadline means no refund. If the booking was part of a package, the session is forfeited.

## Cancellation by the provider

- Full refund for the client.
- No penalty for the client.
- The cancellation is recorded in the provider's history.

## No Show

- No refund.
- If part of a package: the session is forfeited (`remaining sessions--`).

---

⬅️ **Previous:** [Payments & Refunds](./09-payments-and-refunds.md) · **Next:** [Packages & Courses](./11-packages.md) ➡️
