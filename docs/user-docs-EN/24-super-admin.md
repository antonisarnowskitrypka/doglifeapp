# Super Admin

The platform operator's control panel. Separate from the provider/client roles — it manages the platform itself.

## Managing providers

- Browsing all organizations.
- Viewing organization details and activity.
- **Suspending / unblocking** provider accounts.

## Disputes and chargebacks

- A queue of `disputed` bookings and Stripe chargebacks.
- Reviewing each case and resolving it — releasing escrow to the provider or refunding the client.
- Resolving a dispute releases the held payment (see [Payments](./09-payments-and-refunds.md)).

## Platform invoices and commissions

- Issuing and viewing the platform's invoices for providers.
- Configuring **commission rates** (no subscription 7.5% / Pro 4.5%), the subscription price (€11/mo) and the size of the referral discount (1 pp).
- **Special per-provider commission** — any absolute rate for a set period (e.g., testers: a flat 3% with no subscription for a year). No bonus is added on top of it, and referral discount months are suspended for that period.
- **Manually enabling the Pro subscription** for a provider for any period (without charging) — it unlocks the premium features and the 4.5% rate.

## Support queue

Incoming [support requests](./22-contact-support.md) (questions, problems, bugs) are triaged and handled here.

## Moderation and platform bans

- Moderation of reviews and user content.
- Imposing **platform bans** (abuse spanning multiple providers — as opposed to a provider's own [client ban](./21-client-ban.md)).
- Managing central catalogs: main service categories (with color/icon), service tags, pet handling questions, review highlight tags.

---

⬅️ **Previous:** [Disputes](./23-disputes.md) · **Next:** [Demo Page](./25-demo.md) ➡️
