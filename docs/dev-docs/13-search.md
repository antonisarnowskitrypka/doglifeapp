# Search

Marketplace search by tags/name, optional date, and delivery mode (online / at client's home / at a provider location), with H3-based geospatial matching.

## Delivery Model

Delivery has **two layers** (see [Geocoding & Maps](./36-geocoding-and-maps.md) and `/provider/locations`):

- **Org-level gates + shared config** (`organization.delivery`): three master switches — `online`, `atClient`, `atLocation` — that declare what the business does at all, plus the **single shared `at_client` travel base + radius** and the org's location list. Configured once on `/provider/locations`.
- **Per-service opt-in** (`service.deliveryModes`): each service picks which of the *enabled* modes it offers, and which of the org's locations it uses. A service can't offer a mode the org gate has switched off.

### `organization.delivery`

```
delivery: {
  online:     { enabled: boolean }
  atLocation: { enabled: boolean }                 // gate; actual venues live in the `locations` subcollection
  atClient: {
    enabled: boolean
    travelRadiusKm: number                         // the SINGLE org-wide travel radius (was per-service)
    base: { …geo block… } | null                   // the single travel origin (geocoded; not shown publicly)
  }
}
```

The `at_client` travel base is stored **inline** on the org (one address, one radius — see `/provider/locations`), not as a separate `location` doc.

### `location` (subcollection of organization)

```
id: string
organizationId: string
kind: 'fixed' | 'area'         // fixed address (a venue) | "in the field" area (e.g. meet in a park)
name: string                   // provider's custom label
imageUrl: string | null        // optional venue photo
address: string                // fixed: full address; area: the city/region query
lat: number
lng: number
h3: string                     // H3 index at the fixed search resolution (RES)
areaRadiusKm: number | null    // area only — provider-defined reach around the centroid
```

How `lat/lng/h3` are produced, and the geocoding-related fields on a location (`displayName`, `city`, `postalCode`, `countryCode`, `geocode{…}`, `isPublic`, `geoStatus`, `mapUrl`), are specified in [Geocoding & Maps](./36-geocoding-and-maps.md). An **`area`** location resolves to a **city/region centroid** (precision `city`/`approximate`, always coarse public display) and represents working "in the field" rather than at a fixed venue.

### `service` — search-relevant fields

```
deliveryModes: ('online' | 'at_client' | 'at_location')[]   // provider picks which modes THIS service supports

online: {
  enabled: boolean             // provider toggle; intended for consultations
}

atLocation: {
  locationIds: string[]        // which org locations offer this service
}

atClient: {
  enabled: boolean             // opt-in only; the travel base + radius are ORG-level (organization.delivery.atClient)
}

pricing: {                     // per delivery mode; only modes the service offers are set
  at_location: number | null   // shared across all the service's physical locations
  at_client:   number | null   // flat in MVP (per-km surcharge parked — see below)
  online:      number | null
}

categoryKey: string            // the service's single main category — see Service Categories
tags: string[]                 // taxonomy + service name tokens + org public-equipment tokens (see Equipment)
languages: string[]            // denormalized org language union (see below)
species: string[]              // accepted species for this service ('dog' | 'cat') — see Pets
level: 1 | 2 | 3 | null        // optional advancement level (1 beginner → 3 advanced); null = unspecified
searchCells: string[]          // precomputed H3 coverage cells (see below)
status: 'active' | 'hidden'    // only `active` services in an `active` org appear in search
```

The full **`service` doc** (subcollection `organizations/{orgId}/services`) also carries the operational fields set by the **single-service creator** at `/provider/services`: `name`, `shortDescription` (always shown next to the name) + `description` (long, behind "show more"), `durationMin` + `operationalBufferMinutes` (the calendar reserves `duration + buffer` per slot — see [Calendar → Operational buffer](./06-calendar-and-availability.md#operational-buffer)), `bookingMode` (`book_now`/`request`/`inquiry` — the **default** only; a calendar window can override it per slot, e.g. weekend = request-only, see [Booking State Machine](./05-booking-state-machine.md)), `paymentMethods` (always includes `online`; `cash` opt-in; more from provider payment settings later), and `staffIds` (who delivers it; data-only until the calendar/availability is built — see [Calendar](./06-calendar-and-availability.md)). The `species` selector is shown only when the org accepts both species; otherwise the single accepted species is implied. `languages` is denormalized as the union of the assigned staff's languages (defaulting to all active members). `searchCells` is precomputed on save — the union of the linked locations' coverage (`at_location`) and the org travel-base coverage (`at_client`); `online`-only services carry no cells. Delivery modes are **gated by `organization.delivery`** (a service can't offer a mode the org has switched off — see [Delivery Model](#delivery-model)). Events, courses and packages are **separate** scheduling types, not built by this creator (see [Service Categories](./28-service-categories.md)).

`level` is an optional product attribute on **`service`** and **`course`** (a plain `packageDefinition` has none — it inherits its service's level). Labels (e.g. *beginner / intermediate / advanced*) are localized client-side from the numeric value.

`species` is denormalized from `service.species` (which defaults to `organization.acceptedSpecies`) — see [Pets](./19-pets.md#species--provider-acceptance).

**Per-mode pricing:** a service can offer several delivery modes, **each with its own price** (`pricing.at_location` / `pricing.at_client` / `pricing.online`), in the org currency and integer minor units (see [Conventions](./00-conventions.md)). All physical locations share the single `at_location` price. The price for the **mode the customer chooses** becomes the base price in the [pricing order](./15-provider-dashboard.md#pricing--commission-order). `at_client` is a flat price in MVP — a distance-based surcharge is **parked** (revisit post-MVP).

## Geospatial Strategy (H3)

Firestore has no native geo-radius query, so we precompute H3 cell coverage and query by **array membership** — a single uniform query for both location and home-service search.

### Fixed resolution

A single H3 resolution **`RES = 6`** (~3.2 km cells) is used platform-wide via [`h3-js`](./36-geocoding-and-maps.md#h3). It is a candidate-retrieval bucket only — final distance is always confirmed with haversine — so `RES` affects recall/cost, not accuracy. RES 6 keeps a 30 km `searchCells` array around ~331 cells; the cell-size↔array-size trade-off and the pin rationale are in [Geocoding & Maps → H3](./36-geocoding-and-maps.md#h3).

### Precomputing `searchCells`

When a service or location is saved, compute the set of H3 cells covering its reachable area and store them on the searchable document:

- **At a fixed location:** `searchCells = gridDisk(location.h3, ringsFor(30km))` — cells within the fixed 30 km search radius of the venue.
- **At an `area` location** ("in the field"): `searchCells = gridDisk(location.h3, ringsFor(location.areaRadiusKm))` — the provider-defined reach around the city/region centroid (not the fixed 30 km).
- **At the client's home:** `searchCells = gridDisk(org.delivery.atClient.base.h3, ringsFor(org.delivery.atClient.travelRadiusKm))` — the org's single shared travel base + radius. Recompute every `at_client` service's cells when that org radius/base changes (see [Geocoding & Maps → Re-geocode triggers](./36-geocoding-and-maps.md#re-geocode-triggers)).

`ringsFor(km)` converts a kilometre radius to an H3 k-ring count at `RES` — `ceil(km / avgHexEdgeKm(RES)) + 1` (edge-step + safety ring; see [Geocoding & Maps → H3](./36-geocoding-and-maps.md#h3)). It may slightly over-cover, which is harmless because haversine refines.

### Query

The searcher's point — GPS coordinates, or an address/city geocoded server-side (see [Geocoding & Maps](./36-geocoding-and-maps.md)) — is converted to its H3 cell at `RES`:

```
userCell = latLngToCell(userLat, userLng, RES)
```

A typed **city** geocodes to its centroid before this step — a single-cell approximation that's acceptable given the 30 km disk + haversine refine (see [Geocoding & Maps → City → cell](./36-geocoding-and-maps.md#city--cell-search)). GPS needs no geocoding.

Then a single query per delivery mode:

```
where('categoryKey',   '==', selectedCategory)              // PRIMARY criterion
where('deliveryModes', 'array-contains', mode)
where('searchCells',   'array-contains', userCell)
where('species',       'array-contains', selectedSpecies)    // species filter
where('tags',          'array-contains-any', selectedTags)   // if tags chosen
where('languages',     'array-contains', selectedLanguage)   // if language chosen
```

Only services of **published** organizations (`organization.status == 'active'`) appear in search — `draft` (unpublished) and `suspended` orgs are excluded. Publishing/suspending toggles their services' search inclusion (see [Accounts & Membership](./20-accounts-and-membership.md)).

### Main category (primary criterion)

The **main category** is the first search criterion (see [Service Categories](./28-service-categories.md)). While the user types tags/terms, a strong match that belongs to a **different** category appears in autocomplete with **that category's icon + colour**; selecting it switches `selectedCategory` and re-runs the search.

### Species filter

`selectedSpecies` defaults from the client's own pet(s):

- **Single-species owner** (only dogs, or only cats) → default to that species; no selector needed.
- **Dual-species owner** (both dogs and cats) → show a prominent species selector so the client picks which to search for. (Otherwise the selector lives under a future "More" menu.)

Finally, refine in memory with **haversine** to enforce the exact radius (30 km for `at_location`, `travelRadiusKm` for `at_client`), compute each candidate's distance, then order the surviving set by the composite **[ranking score](#ranking)**.

### Level filter (secondary)

Advancement level is an **optional, secondary** filter living under the **"More"** menu (not a primary control). When the searcher picks a level, it's applied as an **in-memory refine** on the candidate set (alongside haversine/date), matching products with that `level` **or no level set** (`null` always passes) — so unspecified products are never hidden. Kept in memory rather than as a Firestore predicate to avoid an OR query; the volume is already bounded by the geo/category candidate set.

### Online search

`deliveryModes array-contains 'online'` and `online.enabled == true`. No location filter. `online.enabled` is a per-service provider flag (intended for consultations).

## Ranking

After the candidate set is built and refined (geo radius, optional date/level), results are ordered by a single **weighted-sum score** computed in memory. Each factor is normalized to **0–1** and multiplied by a weight from `platformConfig.searchRankingWeights` (tunable without a deploy). The candidate set is already a hard match on **category + delivery mode + species + geo cell**; ranking only orders *within* it.

```
score(service) =
    w_tag       * tagRelevance        // search-term match quality
  + w_rating    * ratingScore         // org-level weighted rating
  + w_distance  * proximityScore      // 0 for online (distance not applicable)
  + w_boost     * boostScore          // Pro Search Boost
  + w_fresh     * freshnessScore      // new-object visibility bonus
```

Weights live in config (e.g. defaults `{ tag: 0.40, rating: 0.20, distance: 0.20, boost: 0.10, fresh: 0.10 }`, summing to 1). Sort descending; ties broken by distance then rating then newest.

### Factors

- **`tagRelevance`** — overlap between the searcher's selected tags/terms and the service's `tags`, **weighted by match kind**: a hit on the service **name/title token** counts more than a plain taxonomy-tag hit (config `tagNameMatchWeight` > `tagTaxonomyMatchWeight`). Normalized by the best achievable match for the query so it lands in 0–1. With no tags entered, `tagRelevance` is neutral (constant) and the other factors decide order.
- **`ratingScore`** — the org's **weighted** rating `(avg − 1) / 4` (loyalty reviews weigh more — see [Reviews](./16-reviews.md)). Per-specialist ratings do **not** feed ranking — discovery is org-scoped. New orgs with too few reviews shrink toward the platform mean (same shrinkage idea as the trust score, see [Analytics](./34-analytics-and-insights.md#trust-score-private-insight)) so a single 5★ doesn't dominate.
- **`proximityScore`** — `1 − (distanceKm / radiusKm)` (closer = higher), using the applicable radius (30 km for `at_location`, `travelRadiusKm` for `at_client`). **For `online` search this factor is 0 / excluded** and its weight is redistributed across the others — distance is meaningless online.
- **`boostScore`** — `1` while the org is on an active **Pro** subscription (`providerBilling.subscription.status === 'active'`, covering `self` + `admin_grant` — see [Platform Billing](./15-provider-dashboard.md#platform-billing--subscription)), else `0`. This is the **Search Boost** premium: a weighted lift **within the same candidate set**, never a separate "promoted" section and never overriding the geo radius.
- **`freshnessScore`** — a decaying **new-object bonus**: `max(0, 1 − ageDays / freshnessWindowDays)` (config `freshnessWindowDays`, default **30**), so it starts at 1 on publish and **linearly decays to 0** over ~30 days. Applies to **newly published organizations and newly published services/courses/events** (uses the entity's publish/activation timestamp). Gives new listings an initial visibility runway without a permanent advantage. A **"New" badge** may show while `freshnessScore > 0`.

### Config

```
// platformConfig.searchRankingWeights
{ tag: number, rating: number, distance: number, boost: number, fresh: number }   // sum ~1
// plus
tagNameMatchWeight: number          // weight of a name/title token hit
tagTaxonomyMatchWeight: number      // weight of a taxonomy-tag hit
freshnessWindowDays: number         // default 30
ratingShrinkageMinReviews: number   // below this, ratingScore shrinks toward platform mean
```

## Languages

Spoken languages are set **per staff member** (`staff.languages: string[]`, ISO codes). An organization's language set is the **union** of its staff's languages, denormalized onto each service's searchable doc as `languages[]` so a single `array-contains` filter works. Recompute the union whenever a staff member's languages change or staff are added/removed.

## Date Filtering

The date input is **optional**:

- **No date** → general search; availability is not checked at query time.
- **Specific date** → after the geo/tag candidate set is built, filter by real availability for that date, per service scheduling type (see [Calendar & Availability](./06-calendar-and-availability.md)):
  - `scheduled` → at least one free slot that day (union of the **qualified** staff's availability minus existing bookings — see [Staff ↔ Service Assignment](./06-calendar-and-availability.md#staff--service-assignment))
  - `fixed_event` → an event exists on that date with remaining capacity
  - `stay` → occupancy available across the requested range

## Indexing & SEO

Search result and provider/service pages are server-rendered and indexable (see [Architecture](./01-architecture.md)). Tag taxonomy values double as SEO-friendly facets. **Courses**, **events**, and **recurring event series** each have their own public, indexed page (own URL/slug) — a series page lists its upcoming occurrences (see [Recurring event series](./06-calendar-and-availability.md#recurring-event-series)); plain packages have no public page (see [Packages & Courses](./08-packages.md)). These URLs are what the provider's [QR codes](./15-provider-dashboard.md#qr-codes) point to.

## Analytics Emission

The search path feeds the [Analytics & Insights](./34-analytics-and-insights.md) pipeline:

- The search route writes **one `search_impression_set` event per executed search**, holding the ranked `shownOrgs[]` (capped) plus `searchContext` (category, mode, species, coarse `userCell`) and a server-issued `sessionId`.
- Opening a result emits **`search_click`** carrying the same `sessionId` and the result's `rank`, so impression → click → booking can be stitched into a funnel.

These are **read-only to analytics** and do **not** affect ranking in MVP (the trust score does not feed ranking either — see [Analytics](./34-analytics-and-insights.md#trust-score-private-insight)).

## Search Infrastructure (MVP decision)

MVP search is **Firestore-only**: filtering by type, tags, language, delivery mode, geo (H3), and date — all equality / `array-contains`. Service/provider **names are matched as tokens** in `tags`.

Firestore does **not** do full-text (no tokenization, fuzzy/typo matching, or relevance ranking). True free-text search over descriptions/names is **parked**: when needed, add an external engine (Typesense/Meilisearch/Algolia) as an index synced from Firestore — an additive step, not a redesign.

## Notes / Tuning

- `RES` and `ringsFor()` are the main tuning knobs (pinned **`RES = 6`** — see [Geocoding & Maps → H3](./36-geocoding-and-maps.md#h3)). Document any change — it requires recomputing `searchCells` for all services/locations.
- `array-contains-any` is capped at 30 values; keep selected-tag sets within that bound or split queries.
- Recompute `searchCells` whenever a linked location moves or `travelRadiusKm` changes.
