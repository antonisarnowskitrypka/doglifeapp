# Payments and Refunds

## Payment methods

| Method | Description |
|---|---|
| Stripe | Default for bookings made through the platform — online card payment |
| Cash | Recorded manually by the provider |
| Custom | Other arrangement recorded by the provider |

In the MVP we don't store card details — every payment goes through Stripe Checkout.

## Platform commission

The platform automatically takes a commission on every transaction via Stripe Connect, calculated on the post-discount price (after applying a [discount code or promotion](./19-provider-dashboard.md)). The rate depends on the provider's plan:

- **no subscription — 7.5%**,
- **with Pro subscription (€11/mo) — 4.5%** plus premium features,
- **an active referral** lowers the rate by an **additional 1 pp** (see [Referrals](./20-referrals.md)).

The provider can see the current rate in the dashboard under **Billing** (see [Business Dashboard](./19-provider-dashboard.md)).

## Payment flow (booking through the platform)

```
Client → Stripe Checkout → Escrow → (after the service) → Provider
```

Funds are held in escrow until the service is performed, then released to the provider.

## Guest checkout

Clients without an account can pay via Stripe Checkout. An account is not required.

## Manual bookings

The provider can create bookings manually (for existing or new clients) and record any payment method themselves (cash/custom) — in that case **we don't take a commission**.

A manual booking for a **registered** client can also be sent for **payment via Stripe**. In that case it works like a regular platform payment: the standard commission applies (per the provider's plan) and the normal escrow (funds held until the service is performed).

## Refunds

| Situation | Refund |
|---|---|
| Client cancels within the free window | Full refund |
| Client cancels after the free window | No refund |
| Provider cancels | Full refund for the client |
| No show | No refund |

## Requesting a refund despite the policy

If you cancel **after the free window** or a **no-show** happens (so no refund is due), you can attach a **reason** and ask the provider to refund anyway — e.g. a serious family situation. This is the provider's goodwill, not a complaint (disputes are for services already performed — see [Disputes](./23-disputes.md)).

- **The cancellation finalizes immediately** per policy (slot released, any package session consumed) — the request is a separate thread and holds nothing up.
- The provider may: refund **in full** or **in part**, **restore the consumed session** (package/course), or **decline**.
- If the provider doesn't respond within the set window, the request **expires** with no refund.
- Both sides are notified when the request is submitted and when it's decided.

---

⬅️ **Previous:** [Terms & GDPR](./08-terms-and-gdpr.md) · **Next:** [Booking Lifecycle](./10-booking-lifecycle.md) ➡️
