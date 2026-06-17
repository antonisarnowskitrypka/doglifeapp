# Disputes

A dispute is a disagreement over whether a booked service was performed properly. It's tied to a specific booking.

## When it can be opened

Within the **24-hour confirmation window** after the service time (see [Booking Lifecycle](./10-booking-lifecycle.md)).

- **Either party** — the client or the provider — can open a dispute within this window.
- Once the window passes without a dispute, the booking closes automatically and the payment is released — after that a dispute can no longer be opened in the app.

## What happens

1. A party opens a dispute with a **reason** and optional **evidence** (attachments).
2. The booking moves into the **Disputed** status, and the payment stays **on hold** (escrow is not released).
3. The platform operator reviews the case and resolves it — either **releasing** the payment to the provider or **refunding** the client (see [Super Admin](./24-super-admin.md)).

## Chargebacks

A card chargeback raised through the client's bank is separate from an in-app dispute and is handled by the platform operator independently.

---

⬅️ **Previous:** [Contact Support](./22-contact-support.md) · **Next:** [Super Admin](./24-super-admin.md) ➡️
