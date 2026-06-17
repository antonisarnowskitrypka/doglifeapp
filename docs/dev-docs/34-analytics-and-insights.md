# Analytics & Insights

Provider-facing analytics built on a marketplace **event-tracking pipeline**. **Basic** analytics are free; **advanced** analytics + deterministic predictions are a **Pro** premium feature (see [Platform Billing](./15-provider-dashboard.md#platform-billing--subscription)).

## Principles

- **Server-authoritative.** Clients never write events to Firestore. Every event is emitted from a Nuxt server route or an existing Cloud Function trigger via the Admin SDK (see [Firebase & Security](./03-firebase-and-security.md)).
- **Aggregates on the read path.** Provider dashboards read **pre-rolled aggregate docs** only — never raw events. Raw events are an append-only write sink, rolled up by scheduled functions.
- **No AI / ML / LLM.** Every "prediction" is a closed-form arithmetic computation over the provider's own aggregate time series — fully reproducible and explainable. Confidence is expressed as **sample-size bands**, never model probabilities. ML-based forecasting is parked (see [Roadmap](./33-post-mvp-roadmap.md)).
- **Conventions.** Money in integer minor units, one currency per org; timestamps stored UTC and bucketed in the org's IANA timezone; enums `lower_snake_case` (see [Conventions](./00-conventions.md)).

This doc **supersedes** the earlier "no event-tracking pipeline in MVP" note in [Provider Dashboard](./15-provider-dashboard.md).

## Event Pipeline

### `analyticsEvents` (append-only, raw)

Top-level collection, write-only sink. No PII beyond opaque IDs; `userCell` is a coarse H3 cell (search resolution), not a precise locator.

```
id: string
eventType: string                // enum below
organizationId: string | null    // the org the event is ABOUT; null for platform-level (impression sets)
serviceId: string | null
staffId: string | null
bookingId: string | null
conversationId: string | null
reviewId: string | null
actorRole: 'customer' | 'staff' | 'system' | 'anonymous'
actorUserId: string | null        // null for anonymous/guest search; never store raw IP
sessionId: string | null          // opaque, server-issued per search session — stitches the funnel
occurredAt: timestamp             // UTC business-event time (e.g. booking confirmed at)
createdAt: timestamp              // write time (may differ from occurredAt for trigger-delayed events)
expiresAt: timestamp              // TTL = createdAt + platformConfig.analytics.rawEventRetentionDays
// sparse, type-specific payload:
searchContext: {                  // search_impression_set / search_click
  categoryKey: string
  deliveryMode: 'online' | 'at_client' | 'at_location'
  species: string | null
  rank: number                    // 1-based position in results (per shownOrgs entry)
  userCell: string | null         // coarse H3 cell of the searcher
} | null
shownOrgs: { organizationId: string, serviceId: string, rank: number }[] | null  // search_impression_set only
amountMinor: number | null        // booking_* money facts, org currency
currency: string | null           // = organization.currency at event time
cancelledBy: 'customer' | 'provider' | 'system' | null   // booking_cancelled subtype
responseSeconds: number | null    // message_first_response only
```

### `eventType` enum

```
search_impression_set     // ONE doc per search (holds shownOrgs[]) — see impression strategy
search_click              // a result card / profile opened from search (carries sessionId + rank)
profile_view              // a direct profile view NOT originating from a tracked search click
booking_created           // booking submitted (pending / awaiting_payment)
booking_confirmed         // → confirmed
booking_completed         // → completed
booking_cancelled         // → cancelled | late_cancelled_consumed (cancelledBy set)
no_show                   // → no_show
message_first_response    // first staff reply to a customer-initiated bracket (responseSeconds)
review_received           // reviews doc created (rating / weight / confirmed available via reviewId)
follow                    // follows / seriesFollows created
unfollow                  // follow removed (for net-follower trend)
```

### Emission map

| Event | Emitted from | Mechanism |
|---|---|---|
| `search_impression_set` | `POST /api/search` route | server route writes one doc per executed search |
| `search_click` | result-open / click-beacon route (carries `sessionId`, `rank`) | server route |
| `profile_view` | SSR profile route when no click `sessionId` present | server route (sampled) |
| `booking_created` | booking-create action route | server route |
| `booking_confirmed` / `_completed` / `_cancelled` / `no_show` | `bookings` status-change trigger | Cloud Function (reuses the **existing notification trigger**, see [Notifications](./09-notifications.md)) |
| `message_first_response` | `conversations/{id}/messages` create trigger | Cloud Function |
| `review_received` | `reviews` create trigger | Cloud Function |
| `follow` / `unfollow` | follow create/delete routes | server route |

Booking/review/message events **piggyback on the triggers that already fire notifications** for the same transitions — we add one emission call inside the existing handler rather than new infrastructure.

**`message_first_response` definition:** for a conversation thread, the first `senderRole: 'staff'` message after the **earliest unanswered** `senderRole: 'customer'` message; `responseSeconds = staffMsg.createdAt − customerMsg.createdAt`. A small `conversations.awaitingResponseSince` marker avoids rescanning the thread (see [Chat model](./12-provider-profile-and-chat.md)).

### High-volume impression strategy

A single search can show many orgs; emitting one event per (search × org) multiplies writes by N. Instead we write **one `search_impression_set` per search**, holding `shownOrgs[]` (capped at `platformConfig.analytics.impressionRankCap`, default 50). The rollup fans this out per org during aggregation (off the hot path).

- **`impressionSampleRate`** (default `1.0`): at scale, drop to e.g. `0.25` and multiply impression counts by `1/rate` at rollup. CTR stays unbiased (clicks reference the same sampled sessions).
- **Clicks are never sampled** (low volume, high value).
- A counter-increment optimization (per-org daily `FieldValue.increment`) is **parked** — it would lose funnel stitching and rank distribution (see [Roadmap](./33-post-mvp-roadmap.md)).

### Rollups → aggregate collections

A **scheduled Cloud Function** (hourly, plus a nightly reconciler recomputing the last 48h to absorb trigger-delayed/late events) reads new `analyticsEvents` since a watermark (`analyticsRollupState { lastProcessedCreatedAt, lastRunAt }`) and writes aggregates. Rollups recompute a window from raw events (idempotent), not blind increments.

**`analyticsDaily`** — per `(organizationId[, serviceId], localDate)`:

```
id: string                      // `${organizationId}_${localDate}` or `${organizationId}_${serviceId}_${localDate}`
organizationId: string
serviceId: string | null        // null = org-wide; set = per-service rollup
localDate: string               // 'YYYY-MM-DD' in organization.timezone
timezone: string                // org tz snapshot at rollup time
currency: string
impressions: number
clicks: number
profileViews: number
bookingsCreated: number
bookingsConfirmed: number
bookingsCompleted: number
bookingsCancelled: number
bookingsCancelledByCustomer: number
bookingsCancelledByProvider: number
lateCancelledConsumed: number
noShows: number
revenueMinor: number            // Σ completed-booking provider-side netPrice, org currency
reviewsReceived: number
ratingSumWeighted: number       // Σ rating·weight  (rolling weighted avg, reuses Reviews aggregation)
ratingWeightSum: number         // Σ weight
followsGained: number
followsLost: number
firstResponseSecondsSum: number
firstResponseCount: number
updatedAt: timestamp
```

**`analyticsHourOfWeek`** — per org, the demand heatmap over a trailing window:

```
id: string                      // `${organizationId}_${windowTag}` (e.g. 'rolling_8w')
organizationId: string
timezone: string
window: { fromLocalDate: string, toLocalDate: string }
buckets: {                      // 168 cells keyed 'dow_hour', dow 1=Mon..7=Sun, e.g. '5_17' = Fri 17:00
  [dowHour: string]: { impressions: number, clicks: number, bookingsCreated: number, bookingsCompleted: number }
}
updatedAt: timestamp
```

**Timezone bucketing (critical):** convert each event's UTC `occurredAt` to `organization.timezone` (IANA, DST-safe), then derive `localDate`, `localWeekday`, `localHour` from the **local wall-clock**. The tz is snapshotted onto the aggregate so historical buckets stay interpretable if the org later changes timezone.

**Returning-client counter** — `customerBookingCounts/{organizationId}_{customerId} { completedCount }`, incremented on `booking_completed`. Avoids storing customer-id arrays on daily docs.

### Retention

| Data | Retention |
|---|---|
| `analyticsEvents` (raw) | TTL `rawEventRetentionDays` (default 90) — native Firestore TTL on `expiresAt` |
| `analyticsDaily` | long-lived, `aggregateRetentionDays` (default ~1095 / 36 mo) |
| `analyticsHourOfWeek` | rolling — recomputed each run, only current window kept |
| `analyticsRollupState`, `customerBookingCounts` | permanent (tiny) |

All provider-facing reads use aggregates (non-identifying counts), so GDPR erasure of raw events stays parked (see [Roadmap](./33-post-mvp-roadmap.md)).

## Metrics Catalogue — Free vs Premium

Read endpoints serve from `analyticsDaily` / `analyticsHourOfWeek`, scoped by `(organizationId, period, [serviceId], [staffId])`.

### Free (basic) — every org

| Metric | Definition |
|---|---|
| Impressions | Σ `impressions` |
| Clicks | Σ `clicks` |
| CTR | `clicks / impressions` (0 if no impressions) |
| Profile opens | Σ `clicks + profileViews` |
| Booking volume over time | Σ `bookingsCreated` / `bookingsCompleted` per day/week |
| Revenue over time | Σ `revenueMinor` per period (org currency) |
| Cancellation rate | `(bookingsCancelled + lateCancelledConsumed) / bookingsConfirmed` |
| No-show rate | `noShows / bookingsConfirmed` |
| Returning-client rate | clients with ≥2 completed / distinct clients with ≥1 completed (from `customerBookingCounts`) |
| Top services | bookings/revenue grouped by `serviceId`, ranked |
| Busiest booked slots (basic) | top-3 weekday×hour by `bookingsCompleted` (descriptive only) |
| Avg message response time | `firstResponseSecondsSum / firstResponseCount` |
| Weighted rating + count | `ratingSumWeighted / ratingWeightSum` (reuses [Reviews](./16-reviews.md)) |
| Price benchmark **teaser** | "below / at / above market median" for a service — **no numbers** (see below) |

Free reads are clamped to `platformConfig.analytics.freeHistoryDays` (default **30**).

### Premium (Pro) — everything above, plus

- **Conversion funnel** — impressions → clicks → bookingsCreated → bookingsCompleted, with drop-off `stepₙ / stepₙ₋₁` (and the deeper breakdown below).
- Full **7×24 demand heatmap** + **demand-vs-availability gap** suggestions (see [High-Demand Hours](#high-demand-hours)).
- **Deterministic predictions** (see below).
- **Full price benchmarking** — median + p25/p75.
- **Trust score** (private — see below).
- Funnel **by search rank band / delivery mode / category**; churn-risk client list; per-staff advanced breakdown.
- **Longer history** — up to `premiumHistoryDays` (default **90**).

## Deterministic Predictions (No AI)

> No machine-learning model, no LLM, no AI of any kind. Each value is closed-form arithmetic over the org's aggregate series, fully reproducible. Confidence is a **sample-size band**: `low (n<10)`, `medium (10–30)`, `high (n>30)` (thresholds in `platformConfig.analytics.confidenceBands`).

Building blocks: trailing **moving average**; **OLS linear fit** (`slope b`, `intercept a` over points `(i, yᵢ)`); **seasonal index** `bucketAvg / overallAvg`.

| Insight | Method |
|---|---|
| **Expected bookings next week** | OLS over last 8 weekly completed counts → extrapolate one step `a + b·next`, clamp ≥0 |
| **Demand forecast (weekday×hour)** | `seasonalIndex(dow,hour) = demandSignal / mean(demandSignal)`, `demandSignal = clicks + bookingsCreated` |
| **Client churn-risk (RFM)** | `recencyDays` vs client `typicalGap` (median consecutive-booking gap; fallback org median): `> churnMultiplier·gap` → `at_risk`, `> gap` → `cooling`, else `active` |
| **Revenue projection (period end)** | linear run-rate `revenueToDate / elapsedFraction` |
| **Capacity / utilization outlook** | `bookingsCompleted / offeredSlots` per bucket vs `lowUtilThreshold` (offered slots from [Calendar](./06-calendar-and-availability.md)) |

Each insight is shown with its inputs and confidence band, labelled "estimate based on your history" — never "AI prediction."

## High-Demand Hours

From `analyticsHourOfWeek` (org-local weekday×hour):

```
1. demandHot = buckets with seasonalIndex ≥ highDemandIndexThreshold (default 1.5)
2. availabilityMap(dow,hour) = does the org currently offer ANY bookable slot then? (from Calendar)
3. gapBuckets = demandHot ∧ NOT availabilityMap            // demand exists, no supply
4. require demandSignal n ≥ minBucketSamples (default 8)   // noise floor
5. rank gapBuckets by demandSignal desc, take top K
```

Surfaced (Pro) as actionable suggestions: *"High demand Fri 17:00–19:00 but you have no availability then — ≈ X searches/week."* (X is the bucket's trailing impression/click count — a count, not a guarantee, with a confidence band.) Free tier sees only descriptive top booked slots, not the gap analysis.

## Price Benchmarking

Anonymized peer benchmarks, computed by a scheduled function into `priceBenchmarks`.

**Peer key:** `(categoryKey, deliveryMode, level, geoBucket, currency)` where `geoBucket` is a coarse H3 cell (`benchmarkGeoRes`, default = search RES), `level` matches `service.level` (`null` merged when `benchmarkMergeNullLevel`), and **currency must equal the requesting org's currency** (one currency per org — never compare across currencies). Source prices = `service.pricing[mode]` of **published** (`status: 'active'`) orgs only.

```
id: string                      // hash of the peer-group key
categoryKey: string
deliveryMode: 'online' | 'at_client' | 'at_location'
level: 1 | 2 | 3 | null
geoBucket: string               // coarse H3
currency: string
sampleSize: number              // distinct ORGS contributing (k-anonymity unit)
p25Minor: number
medianMinor: number
p75Minor: number
computedAt: timestamp
```

**Privacy controls (mandatory):**

- **k-anonymity** — publish only if `sampleSize ≥ benchmarkMinSampleSize` (default **5 distinct orgs**); below → `insufficient_data`, never a value.
- **One org = one vote** — dedupe by `organizationId` so a large provider can't be reverse-engineered.
- **Medians/percentiles only** — p25 / median / p75 returned; never min/max, never an individual competitor price or identity.
- **Same currency only.**

**Access:** **Pro** sees full values (median, p25–p75). **Free** sees a **teaser** — "below / at / above market median" for their own service, with **no numbers** — to drive upgrades.

## Trust Score (Private Insight)

A deterministic composite computed from signals that already exist (no new collected data, no new review fields). Inputs normalized to 0–1:

| Input | Source | Normalization |
|---|---|---|
| Weighted rating | `Σ rating·weight / Σ weight` ([Reviews](./16-reviews.md)) | `(avg − 1) / 4` |
| Confirmed-review ratio | confirmed / total reviews | already 0–1 |
| Completion rate | `completed / (completed + cancelled + lateCancelled + noShow)` | 0–1 |
| Reliability | `1 − (providerCancelled + noShow) / confirmed` | 0–1 |
| Response speed | avg first-response seconds | `clamp(1 − seconds / responseTargetSeconds)` |

```
raw = w_rating·ratingN + w_confirmed·confirmedRatio + w_completion·completionRate
    + w_reliability·reliabilityN + w_response·responseN          // weights sum to 1

// volume shrinkage toward the platform mean (deterministic) so new/low-volume orgs aren't mis-scored:
volumeWeight = min(1, completedBookings / trustVolumeFullMark)
trustScore   = round(100 · ( volumeWeight·raw + (1 − volumeWeight)·platformMeanTrust ))
```

**Visibility (MVP):** **private provider insight only** — `trust.showToProvider = true`, `showPublicBadge = false`, `feedRanking = false`. No public badge; does **not** feed marketplace ranking (which stays distance + org weighted rating + Search Boost — see [Search](./13-search.md)). The toggles live in `platformConfig` so a public badge / ranking input can be revisited post-MVP (see [Roadmap](./33-post-mvp-roadmap.md)) without a schema change.

## Premium Gating & Config

A single server helper `isPremium(orgId)` = `providerBilling.subscription.status === 'active'` (the same gate as Search Boost and auto Google Meet; covers both `self` and `admin_grant` sources — see [Platform Billing](./15-provider-dashboard.md#platform-billing--subscription)). Analytics read routes:

- always return the free metrics; **strip** advanced fields (funnel, predictions, full benchmark, trust score, demand-gap, full heatmap) when not premium,
- **clamp** the requested period to `freeHistoryDays` (30) for non-premium, and to `premiumHistoryDays` (90) for premium,
- return `403 premium_required` for premium-only endpoints (full benchmark, predictions, trust score, demand-gap, full heatmap).

Gating is server-side only — never client-side or in Firestore rules (see [Firebase & Security](./03-firebase-and-security.md)).

### `platformConfig.analytics`

Extends the central config (see [Super Admin](./24-super-admin.md)):

```
analytics: {
  rawEventRetentionDays: number      // default 90
  aggregateRetentionDays: number     // physical aggregate retention; default 1095
  freeHistoryDays: number            // free-tier read window; default 30
  premiumHistoryDays: number         // Pro read window; default 90
  impressionSampleRate: number       // 0–1; default 1.0
  impressionRankCap: number          // default 50
  confidenceBands: { mediumMin: number, highMin: number }   // default { 10, 30 }
  highDemandIndexThreshold: number   // default 1.5
  minBucketSamples: number           // default 8
  churnMultiplier: number            // default 2.0
  responseTargetSeconds: number      // default 3600
  benchmarkMinSampleSize: number     // default 5 (k-anonymity)
  benchmarkGeoRes: number            // default = search RES
  benchmarkMergeNullLevel: boolean   // default true
  trustScoreWeights: { rating, confirmed, completion, reliability, response }   // sum to 1
  trustVolumeFullMark: number        // default 50
  trust: { showToProvider: boolean, showPublicBadge: boolean, feedRanking: boolean }  // default { true, false, false }
}
```

## Cross-References

- Emission sources: [Search](./13-search.md) (impressions/clicks), [Booking State Machine](./05-booking-state-machine.md) (booking transitions), [Chat](./12-provider-profile-and-chat.md) (response time), [Reviews](./16-reviews.md) (review_received + trust inputs), [Follows](./31-follows.md).
- Rollup/trigger pattern: [Notifications](./09-notifications.md). Premium model: [Provider Dashboard](./15-provider-dashboard.md). Config: [Super Admin](./24-super-admin.md). Parked extensions: [Roadmap](./33-post-mvp-roadmap.md).
