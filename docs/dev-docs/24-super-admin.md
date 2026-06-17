# Super Admin

Platform-level operations panel. The `super_admin` role is **not** org-scoped (unlike Owner/Staff in [organizationMembers](./20-accounts-and-membership.md)) — it's a platform capability gated separately in server routes.

## Role

```
// on users (or a dedicated platformAdmins record)
isSuperAdmin: boolean
```

All super-admin routes verify this flag server-side and are isolated from tenant routes.

## Provider Management

- List/inspect `organizations`.
- Suspend/unsuspend via `organization.status: 'draft' | 'active' | 'suspended'` (`draft` = unpublished new provider; see [Accounts & Membership](./20-accounts-and-membership.md)). Only `active` orgs are searchable and bookable; a suspended org cannot take bookings or payouts (checked in [booking prerequisites](./05-booking-state-machine.md#booking-prerequisites)).

## Disputes & Chargebacks

Resolves the parked dispute flow (see [Payments](./07-payments.md#parked)).

### `disputes`

```
id: string
bookingId: string
organizationId: string
source: 'completion_window' | 'stripe_chargeback'
status: 'open' | 'resolved_release' | 'resolved_refund'
openedBy: string | null         // userId who opened (null for chargeback)
reason: string | null
evidence: Attachment[]           // optional; Storage rules apply
stripeDisputeId: string | null
openedAt: timestamp
resolvedAt: timestamp | null
resolvedBy: string | null       // super-admin userId
notes: string | null
```

The open flow (24h window, who can open) is described in [Disputes](./27-disputes.md).

- Opened by a `disputed` booking transition or a Stripe `charge.dispute.*` webhook.
- Resolution releases escrow to the provider or refunds the customer, then transitions the booking accordingly.

## Platform Invoices & Commission Config

- Issue/view `platformInvoices` (see [Provider Business Dashboard](./15-provider-dashboard.md)).
- Central config document:

```
// platformConfig
{
  defaultCommissionRate: number,     // no subscription; default 0.075
  subscribedCommissionRate: number,  // Pro subscription; default 0.045
  subscriptionPriceMinor: number,    // Pro price, integer minor units; default 1100 (€11.00)
  subscriptionCurrency: string,      // default 'EUR'
  referralDiscountPoints: number,    // referral discount size; default 0.01 (1 p.p.)
  loyaltyReviewThreshold: number,    // services with one provider to unlock a loyalty review; default 3
  goodwillRefundWindowDays: number,  // provider window to answer a goodwill refund request; default 7
  searchRankingWeights: {            // composite ranking weights (sum ~1) — see Search §Ranking
    tag: number, rating: number, distance: number, boost: number, fresh: number
  },                                 // default { tag:0.40, rating:0.20, distance:0.20, boost:0.10, fresh:0.10 }
  tagNameMatchWeight: number,        // name/title token hit weight (> taxonomy); search ranking
  tagTaxonomyMatchWeight: number,    // taxonomy-tag hit weight
  freshnessWindowDays: number,       // new-object visibility decay window; default 30
  ratingShrinkageMinReviews: number, // below this, ratingScore shrinks toward platform mean
  analytics: {                       // Analytics & Insights tuning — see doc 34
    rawEventRetentionDays: number,   // default 90 (raw analyticsEvents TTL)
    aggregateRetentionDays: number,  // physical aggregate retention; default 1095 (~36 mo)
    freeHistoryDays: number,         // free-tier read window; default 30
    premiumHistoryDays: number,      // Pro read window; default 90
    impressionSampleRate: number,    // 0–1; default 1.0
    impressionRankCap: number,       // default 50
    confidenceBands: { mediumMin: number, highMin: number },  // default { 10, 30 }
    highDemandIndexThreshold: number,// default 1.5
    minBucketSamples: number,        // demand-suggestion noise floor; default 8
    churnMultiplier: number,         // default 2.0
    responseTargetSeconds: number,   // default 3600
    benchmarkMinSampleSize: number,  // k-anonymity; default 5 distinct orgs
    benchmarkGeoRes: number,         // H3 res for peer geoBucket; default = search RES
    benchmarkMergeNullLevel: boolean,// default true
    trustScoreWeights: { rating: number, confirmed: number, completion: number, reliability: number, response: number }, // sum to 1
    trustVolumeFullMark: number,     // shrinkage volume; default 50
    trust: { showToProvider: boolean, showPublicBadge: boolean, feedRanking: boolean } // default { true, false, false }
  }
}
```

Booking fee calculation resolves the org's effective rate from these values + the org's `providerBilling` (see [commission model](./15-provider-dashboard.md#platform-billing--subscription)). The `analytics` block tunes the [Analytics & Insights](./34-analytics-and-insights.md) pipeline — retention, sampling, benchmark k-anonymity, and the trust-score weights/visibility toggles (MVP: trust score is a private provider insight, no public badge, no ranking influence).

### Per-provider billing overrides

Two **independent** levers, both super-admin-only and time-boxable, written to the org's `providerBilling`:

- **Custom commission** (`customCommission.rate` + `until`) — an **absolute** effective rate that overrides everything. **No bonus stacks on it**, and the org's `referralDiscount.monthsRemaining` is **paused** (preserved, not burned) while it's active. E.g. give all testers a flat **3%** with no subscription for a year.
- **Manual subscription grant** (`subscription.source: 'admin_grant'` + period) — activates **Pro** (4.5% base + premium features) for any duration **without charging**. Unlike a custom commission, this is a normal subscription, so the referral bonus still applies on top (→ 3.5%).

## Moderation & Platform Bans

- **Review/content moderation** — flag/remove `reviews`.
- **Platform-wide bans**:

```
// platformBans
{ id, userId, reason, bannedBy, bannedAt, active }
```

Checked alongside provider-level [client bans](./17-client-ban.md) at booking/login time.

- **Catalogue management** — central, localised: main service categories (with colour/icon — see [Service Categories](./28-service-categories.md)), service tags, pet handling-question keys, review highlight tags. These are the stable keys referenced across [Search](./13-search.md), [Pets](./19-pets.md), [Reviews](./16-reviews.md).

## Support Queue

Triage of in-app support tickets (questions / problems / bugs) — see [Contact Support](./26-contact-support.md). The admin views `supportTickets`, replies, and moves them through `open → in_progress → resolved`.

## Access Control

- Every super-admin action is server-side and audited (`resolvedBy`, `bannedBy`, etc.).
- Separate from the org permissions in the [Permissions Matrix](./22-permissions-matrix.md).
