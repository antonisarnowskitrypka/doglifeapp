# Provider Business Dashboard

Data models and logic for the provider's finances, invoicing, platform billing, and promotions. All reads/writes go through Nuxt server routes.

## Financial Summary

Computed on the server for a given `(organizationId, period, [staffId])`.

- **Earnings** — aggregated from `bookings` / payment records within the period. Each booking carries `staffId` (who conducted it) for per-trainer breakdown.
- **Expenses** — union of two sources:
  - `expenses` (manual entries)
  - `equipmentServiceLog.cost` from the [Equipment Registry](./11-equipment.md)

### `expenses`

```
id: string
organizationId: string
staffId: string | null          // optional attribution
amount: number
currency: string
category: string
description: string
incurredAt: timestamp
createdAt: timestamp
```

Summary endpoint returns totals + per-staff breakdown; computed on demand (optionally cached). No precomputed aggregate doc in MVP.

## QR Codes

The provider can export QR codes (via `nuxt-qrcode`) that encode the **public URL** of an entity, for print (reception) or social media:

- **Organization** — profile page QR
- **Course** — course page QR
- **Event** — event page QR
- **Event series** — series page QR (recurring events)

Exported as a downloadable, print-ready image/PDF. Each QR simply points to the entity's public, indexed page (see [Search: indexing](./13-search.md)).

## Statistics & Insights

Provider analytics are built on a dedicated **event-tracking pipeline** (search impressions/clicks, booking transitions, cancellations, message response time, reviews, follows) rolled up into aggregate docs — see **[Analytics & Insights](./34-analytics-and-insights.md)** for the full model. **Basic** analytics (impressions, CTR, conversion funnel, volume/revenue over time, cancellation/no-show rate, returning clients, top services, busiest booked slots, avg response time, weighted rating) are **free**; **advanced** analytics + deterministic predictions are a **Pro** premium feature.

Reads hit pre-rolled aggregates, not raw events. Financial summary above stays a separate on-demand computation over `bookings`/`expenses`.

## Client Invoices

Generated from existing booking data — both seller (org) and buyer (customer) details are already stored.

### `invoices`

```
id: string
organizationId: string
customerId: string
bookingId: string
kind: 'simplified'              // 'fiscal' added later
number: string                  // per-organization sequence
issuedAt: timestamp
currency: string                // = organization.currency
lineItems: { description: string, qty: number, unitPrice: number, amount: number }[]
subtotal: number
discountTotal: number
vatRate: number                 // organization.vatRate at issue time
vatAmount: number               // VAT portion (prices are VAT-inclusive)
total: number
sellerSnapshot: { name: string, address: string, taxId: string | null }
buyerSnapshot:  { name: string, address: string, taxId: string | null }   // company details if requested, else personal
issuedToCompany: boolean
pdfUrl: string                  // Firebase Storage
createdAt: timestamp
```

- **Generated automatically** on the booking's transition to `completed` (server-side), then the PDF is attached to the booking's session workspace and the customer is notified. No manual trigger in MVP.
- `kind: 'simplified'` in MVP — a clean PDF, not a guaranteed fiscal document.
- Snapshots freeze party details at issue time. `buyerSnapshot` uses the customer's `companyDetails` when `issuedToCompany` (see [Accounts & Membership](./20-accounts-and-membership.md)).
- All amounts are integer minor units in `currency`; prices are VAT-inclusive with `vatAmount` broken out (see [Conventions](./00-conventions.md)).
- **Later (fiscal):** strict sequential `number` per legal entity, fuller VAT/tax handling, per-country rules. The `kind` field is the extension point.

## Platform Billing & Subscription

The provider's billing relationship with the platform (super admin). This is the **canonical commission model** — [Payments](./07-payments.md) and [Referrals](./18-referrals.md) reference it.

### Commission tiers

| Situation | Effective commission |
|---|---|
| **No subscription** (default) | `platformConfig.defaultCommissionRate` — **7.5%** |
| **Pro subscription** (`€11`/mo) | `platformConfig.subscribedCommissionRate` — **4.5%** + premium features |
| **Referral discount active** | **−1 p.p.** on top of the base (subscriber → 3.5%, non-subscriber → 6.5%) |
| **Super-admin custom commission** | absolute rate set by super-admin — **bonuses do not apply** |

All rates live in [`platformConfig`](./24-super-admin.md) (not hard-coded). The **Pro** subscription unlocks premium features — currently **Search Boost** (ranking bonus, see [Search](./13-search.md#ranking)), **auto Google Meet links** (see [Google Integration](./30-google-integration.md#google-meet-online-sessions)), and **advanced analytics** (predictions, demand heatmap, price benchmarking, trust score — see [Analytics & Insights](./34-analytics-and-insights.md)).

### Effective commission resolution

Computed server-side per booking, in this order:

```
if customCommission active (super-admin):
    rate = customCommission.rate          // ABSOLUTE — no subscription/referral bonus applies
                                          // referralDiscount.monthsRemaining is FROZEN (not consumed)
else:
    base = subscription.active ? subscribedCommissionRate : defaultCommissionRate   // 0.045 : 0.075
    rate = base - (referralDiscount.monthsRemaining > 0 ? referralDiscountPoints : 0)  // −0.01 if active
```

`rate` then feeds the [pricing & commission order](#pricing--commission-order).

### `providerBilling` (one per org)

```
id: string                      // = organizationId
subscription: {
  status: 'none' | 'active' | 'past_due' | 'cancelled'
  source: 'self' | 'admin_grant'        // self-paid (€11/mo) or super-admin manual grant
  currentPeriodStart: timestamp | null
  currentPeriodEnd: timestamp | null
  stripeSubscriptionId: string | null   // null for admin_grant
}
referralDiscount: {
  monthsRemaining: number               // each provider referral adds +1 (months STACK; the discount stays 1 p.p.)
}                                        // ticks down one per monthly billing cycle; FROZEN while customCommission is active
customCommission: {
  rate: number | null                   // absolute effective rate; null = none
  until: timestamp | null
  setBy: string | null                  // super-admin userId
} | null
```

- **Subscription** unlocks premium features whether `source` is `self` (Stripe-billed €11/mo) or `admin_grant` (super-admin, time-boxed, not charged). An `admin_grant` subscription still pairs normally with the referral bonus (→ 3.5%); only a **custom commission** suppresses bonuses.
- **`referralDiscount.monthsRemaining`** is a single counter: the discount is always exactly **1 p.p.** while it's `> 0`, and each successful provider referral adds **one month** of duration (see [Referrals](./18-referrals.md#provider-referrals)). It is **paused** (not decremented) for any month a `customCommission` is active, resuming when the override ends.
- **`customCommission`** is set only by super-admin (e.g. testers on a flat 3% for a year — see [Super Admin](./24-super-admin.md)); it overrides everything and ignores/pauses bonuses.

### `platformInvoices` (platform → provider)

```
id: string
organizationId: string
period: string                  // e.g. '2026-06'
kind: 'commission' | 'subscription'    // subscription line = the €11/mo Pro fee
amount: number
currency: string
issuedAt: timestamp
pdfUrl: string
```

### Billing settings view ("Rozliczenia")

A dedicated **Rozliczenia** screen in provider settings leads with a **large display of the current effective commission**, broken down:

- the **base** (7.5% no-sub / 4.5% Pro) and subscription status + next renewal,
- the **referral discount** (−1 p.p.) with **months remaining**,
- any **super-admin custom commission** and its end date (when present, shown as the active rate),
- a CTA to start/manage the **€11/mo Pro** subscription and what premium it unlocks.

Read-only computed values; the subscription CTA goes through Stripe. Owner-only (see [Access Control](#access-control)).

## Discounts & Promotions

Two mechanisms, both scoped to an organization's own services.

### `discountCodes` (code entered at checkout)

```
id: string
organizationId: string
code: string                    // unique per org
type: 'percent' | 'fixed'
value: number
currency: string | null         // for 'fixed'
appliesTo: string[] | 'all'     // serviceIds
maxRedemptions: number | null
redemptions: number
perCustomerLimit: number | null
startsAt: timestamp
endsAt: timestamp
active: boolean
```

### `promotions` (automatic, time-limited, no code)

```
id: string
organizationId: string
serviceIds: string[]
type: 'percent' | 'fixed'
value: number
currency: string | null
startsAt: timestamp
endsAt: timestamp
active: boolean
```

A promotion applies automatically while within its window; a discount code requires the customer to enter `code` at checkout. A **boosted slot** (`slotPromotions`) is a one-off promo on a single calendar slot — see [Calendar: Day-Plan Quick Actions](./06-calendar-and-availability.md#day-plan-quick-actions).

## Pricing & Commission Order

When pricing a booking at checkout, on the server:

```
1. base price = service price for the CHOSEN delivery mode (see Search: per-mode pricing),
   × pet count if multiPetPricing == 'per_pet'
2. apply active promotion (if any)
3. apply discount code (if entered & valid)
   → netPrice
4. charge customer netPrice via Stripe
5. rate = effective commission for the org (see Effective commission resolution above)
6. marketplace fee = round(netPrice * rate)   // commission on the DISCOUNTED amount
7. provider payout = netPrice - fee
```

The commission is computed on the **discounted** `netPrice` at the org's **effective rate** (tier + referral / custom), so provider and platform share a discount proportionally. Validation (window, redemption limits, applicability) happens server-side before charging.

## Access Control

- All financial data, invoices, codes, and promotions are scoped to the organization and editable by **Owner** (Staff access TBD — likely read-only on finances).
- `platformInvoices` are written by the platform/super-admin side, read-only for the provider. `providerBilling.subscription` is managed by the **Owner** via the Stripe-backed Pro CTA (self-serve), while `referralDiscount` and `customCommission` are written only by the platform/super-admin side.
- Enforced in server routes, not Firestore rules (see [Firebase & Security](./03-firebase-and-security.md)).
