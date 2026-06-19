# Geocoding & Maps

How addresses and cities become coordinates, how provider locations are shown on a **static** map, and how this feeds the H3 search model. Server-authoritative; **no dynamic/interactive maps in MVP** (image tiles only).

The search algorithm itself — `searchCells`, `gridDisk`, the `array-contains` query, haversine refine — lives in [Search](./13-search.md). This doc owns the step that spec assumes: turning an address/city into `{ lat, lng, h3 }`, plus the static map and failure handling.

## Scope (the scenarios)

| # | Scenario | Resolves to | Where |
|---|---|---|---|
| 1 | **Exact address — provider location** | `lat/lng/h3` + structured parts stored on the `location` | provider location setup |
| 2 | **Exact address — `at_client` client address** | precise `lat/lng/h3` stored on the **booking** (PII) | booking for a travel-to-client service |
| 3 | **City — search** | centroid `lat/lng` → `userCell` (transient, not stored) | searcher's location input |
| 4 | **Static map of a provider location** | cached image in Storage | provider profile / location mgmt / `at_location` booking |

Delivery is configured on **`/provider/locations`** as **org-level gates** (online / at_client / at_location) plus the single shared `at_client` travel base + radius and the location list; each service then opts into the enabled modes (see [Search → Delivery Model](./13-search.md#delivery-model)). A location is either a **`fixed`** address or an **`area`** ("in the field" — a city/region centroid the provider covers, e.g. meeting in a park).

"Other" scenarios folded in below: reverse-geocoding stance, caching/normalization, rate-limit handling, multi-country formatting, and re-geocode triggers.

## Provider: Geoapify (primary), LocationIQ (fallback)

The **decisive constraint** is that we must persist `lat/lng` (+ `h3`, `searchCells`) in Firestore **indefinitely** — they are denormalized and read on every search. So the provider's *storage/caching* Terms outweigh coverage/price.

| Provider | Stores coords indefinitely? | Static-map image API (same key)? | Autocomplete | Notes |
|---|---|---|---|---|
| **Geoapify** ✅ chosen | **Yes** — ToS permits caching/storing results | **Yes** | Yes | OSM-based; one key for geocode + autocomplete + static maps; ~3k req/day free |
| **LocationIQ** (fallback) | **Yes** | **Yes** | Yes | OSM-based; ~5k req/day free; drop-in for Geoapify |
| Google Geocoding | **No** — caching of coords restricted (~30 d), and storage coupled to a Google map | Yes (but storage still blocked) | Yes (Places, costly) | Excellent coverage, but ToS-incompatible with our store-forever model |
| Mapbox | Only via paid **Permanent Geocoding** SKU | Yes | Yes | Workable but no free permanent tier |
| Nominatim (public OSM) | Data is open, but usage policy bans production load (1 req/s) | No | No | Would require self-hosting |

**Decision:** **Geoapify** — clears the storage constraint, bundles geocoding + autocomplete + static maps behind one server-side key, adequate PL + EU/UK (UK→Bulgaria) coverage. **LocationIQ** is the documented fallback. Google/Mapbox are rejected **as the persistence source** purely on storage Terms, regardless of coverage.

All geocoding runs **server-side** (secret key, enables caching) behind a swappable adapter `server/utils/geocode.ts` — nothing downstream knows which OSM vendor produced the coords. This matches the platform rule that clients never call third-party APIs or write Firestore directly (see [Architecture](./01-architecture.md), [Firebase & Security](./03-firebase-and-security.md)).

## What gets stored

Coordinates are plain `{ lat, lng }` decimal degrees (WGS84, ≤6 dp), **never a Firestore `GeoPoint`** — we use H3 + haversine, not native geo queries, and plain numbers stay JSON-clean across the Admin SDK ↔ route ↔ SSR boundary (see [Conventions → Geo](./00-conventions.md)).

### `location` additions (extends the model in [Search](./13-search.md#location-subcollection-of-organization))

```
// existing: id, organizationId, kind, name, imageUrl, address, lat, lng, h3, areaRadiusKm
displayName: string            // provider-confirmed normalized label from the geocoder (what we show)
city: string | null            // structured components from the geocoder result
postalCode: string | null
countryCode: string            // ISO 3166-1 alpha-2 (e.g. 'PL','GB','BG')
geocode: {
  provider: string             // 'geoapify' — audit + cache-invalidation if we switch vendors
  precision: 'rooftop' | 'street' | 'postcode' | 'city' | 'approximate' | 'manual'
  confidence: number | null    // 0–1 normalized from the provider's rank/confidence
  sourceQuery: string          // exact input we sent — cache key, debug, re-geocode trigger
  geocodedAt: timestamp
}
isPublic: boolean              // false for home-based providers → approximate map, address hidden
geoStatus: 'pending' | 'ok' | 'low_confidence' | 'failed'   // gates search visibility
mapUrl: string | null          // cached static-map image in Storage (see Static map)
```

A location is one of two **kinds** (set on `/provider/locations`): a **`fixed`** address (a venue clients travel to — 30 km `at_location` disk) or an **`area`** — "in the field", a city/region centroid with a provider-defined `areaRadiusKm` reach (precision `city`/`approximate`, always coarse public display; the provider arranges to meet somewhere in the area, e.g. a park).

The operational **`location` is distinct from the invoice address** `companyDetails.address` (see [Provider Profile](./12-provider-profile-and-chat.md)). Only the `location` is geocoded; `companyDetails.address` stays free text for invoice snapshots.

### `organization.delivery` + `organization.countryCode`

The three delivery gates and the **single shared `at_client` travel base + radius** live on the org (configured once on `/provider/locations`, see [Search → Delivery Model](./13-search.md#delivery-model)):

```
countryCode: string            // ISO 3166-1 alpha-2 — biases geocoding + multi-country formatting (UK→Bulgaria)
delivery: {
  online:     { enabled: boolean }
  atLocation: { enabled: boolean }
  atClient: {
    enabled: boolean
    travelRadiusKm: number       // ONE org-wide radius (no longer per-service)
    base: { …same geo block as a location… } | null   // single travel origin, stored INLINE (not a location doc), never shown publicly
  }
}
```

The travel base is geocoded like a location (h3, `geoStatus`, `searchCells`) but lives inline on the org — one address, one radius. `countryCode` is set at onboarding; defaults alongside `timezone`/`currency`.

### `booking.serviceLocation` — `at_client` client address (PII)

Stored on the **booking** (not the org), only when `deliveryMode === 'at_client'`. See [Booking State Machine](./05-booking-state-machine.md).

```
serviceLocation: {
  address: string              // client-entered (free-text or autocomplete pick)
  lat: number                  // PRECISE client coordinates — provider navigation + radius re-check
  lng: number
  h3: string                   // at RES — for at_client radius validation, NOT analytics
  city: string | null
  postalCode: string | null
  countryCode: string
} | null
```

**Privacy:** these are the precise home coordinates of a private individual — sensitive PII. Visible only to the assigned provider/staff and the customer; never indexed; **never emitted to analytics**. Analytics keep only the coarse `userCell` (see [Analytics](./34-analytics-and-insights.md)). This field is part of the (parked) GDPR-erasure surface (see [Terms & GDPR](./21-terms-and-gdpr.md)).

## H3

- **Library:** [`h3-js`](https://github.com/uber/h3-js) (official Uber H3 JS/WASM binding; runs server-side under Nitro). Functions used: `latLngToCell`, `gridDisk`, `cellToLatLng`, `gridDistance`. See [Tech Stack](./02-tech-stack.md).
- **Resolution `RES = 6`** (platform-wide, pinned). `RES` is a candidate-retrieval bucket only — final distance is always confirmed with haversine — so it affects **recall/cost, not accuracy**. Choice driven by `searchCells` array size for the fixed 30 km `at_location` disk:

  | RES | ~cell edge | rings for 30 km (`k`) | ~cells in disk `3k(k+1)+1` |
  |---|---|---|---|
  | 5 | ~8.5 km | ~4 | ~61 (coarse buckets) |
  | **6 (chosen)** | **~3.2 km** | **~10** | **~331** |
  | 7 | ~1.2 km | ~25 | ~1,951 (tighter buckets, heavier arrays) |

  RES 6 keeps the stored array modest (~331) while ~3.2 km buckets are fine for a haversine-refined search. RES 7 is the tighter-but-heavier alternative. **Changing `RES` requires recomputing every `location.h3` and all `searchCells`** (see [Search → Notes](./13-search.md#notes--tuning)).
- **`ringsFor(km)`** = `ceil(km / avgHexEdgeKm(RES)) + 1` (edge-step approximation, `+1` safety ring). It may slightly over-cover (k-ring is hexagonal, radius circular); over-cover is harmless because haversine is the source of truth, never under-covering.
- The pure constants/math live in **`shared/utils/geo.ts`** (Nuxt 4 `shared/`, single source of truth, no `h3-js`): `RES`, `SEARCH_RADIUS_KM = 30`, the `avgHexEdgeKm` table, `ringsFor()`, `roundCoord()`, `deriveGeoStatus()`, the `GEO_PRECISION`/`GEO_STATUS`/`LOCATION_KIND` enums, the `TRAVEL_RADIUS`/`AREA_RADIUS` slider bounds, and the `Coordinates`/`GeocodeResult` types. It is **auto-imported in the app** but **must be imported with a relative path in `server/`** (`../../shared/utils/geo`) — the `#shared` alias is type-only and does not resolve at Nitro runtime. The `h3-js`-dependent helpers (`cellFor`, `searchCellsFor`) live in **`server/utils/h3.ts`** so the WASM binding never ships to the client.

## Server surface

Built (this spec's implementation):

- **`server/utils/geocode.ts`** — Geoapify adapter (mirrors `server/utils/firebaseAdmin.ts`): `geocode(query, { countryCode })`, `autocomplete(query, { countryCode })`, `staticMapUrl({ lat, lng, zoom, radiusKm, approximate })`, `fetchStaticMap(...)`. Centralizes the secret key (`process.env.GEOAPIFY_API_KEY`), country bias, result normalization to `GeocodeResult`, retry on transient failure, and graceful degradation (no key → `errors.api.geo.notConfigured` (503) so the UI falls back to manual entry; upstream failure → `errors.api.geo.upstream` (502), never a 500).
- **`server/utils/geoPoint.ts`** — `buildGeoPoint(input, { radiusKm, defaultCountry })`: validates **client-supplied** coordinates and derives the persisted geo block (`h3`, `geoStatus`, `searchCells`). The save routes **never geocode themselves** — geocoding happens during the form's confirm-then-commit flow via the `/api/geo/*` routes; the client commits the chosen coordinates. Also `clampRadius()`.
- **`server/utils/location.ts`** — `locationResponse()` (curated client shape, omits the heavy `searchCells`) + `renderLocationMap()` (renders & caches the static map; best-effort).
- **`POST /api/geo/autocomplete`** — authed provider-form typeahead (structured results with coords attached; we store the selection's coords directly, avoiding a second geocode).
- **`POST /api/geo/geocode`** — authed free-text geocode-on-submit (provider manual save fallback; later, searcher city/address).
- **`GET /api/geo/static-map`** — server-proxied static image keyed by `lat/lng/zoom/radiusKm/approximate` (see below). **Public** (loaded via `<img>`, which can't send a Bearer header); accepts only fixed params, never an arbitrary upstream URL.
- **`PATCH /api/orgs/[orgId]/delivery`** — owner-only; the three gates + the shared `at_client` travel base/radius + `countryCode`.
- **`/api/orgs/[orgId]/locations`** (`GET`/`POST`) and **`/api/orgs/[orgId]/locations/[locationId]`** (`PATCH`/`DELETE` + `PUT …/image`) — owner-managed `fixed`/`area` locations.
- **Errors:** `errors.api.geo.*` / `errors.api.location.*` keys via the `apiError()` convention (see [Conventions → Server-side errors](./00-conventions.md)); the client translates them.
- **Cache:** provider coords persisted on the doc *are* the cache. For repeated searcher **city** lookups, a small `geocodeCache` collection keyed by normalized `sourceQuery` (lowercased, trimmed, whitespace-collapsed, + `countryCode`) with a TTL is **parked** until searcher search is built.

## Address input (autocomplete scope)

- **Provider location form → autocomplete.** Low-volume, accuracy-critical (a wrong coord silently breaks search visibility). The provider selects a structured, already-geocoded result; we store its coords directly. This both improves accuracy and largely prevents the bad-geocode problem.
- **Searcher location input → free-text + GPS.** Search volume is the cost driver, so MVP uses geocode-on-submit for typed input and **"use my location"** GPS (no geocoding at all). Searcher autocomplete is **parked** (see [Roadmap](./33-post-mvp-roadmap.md)); keep user-doc copy aligned (see [Search user-doc](../user-docs/05-search.md)).

## City → cell (search)

A typed city is geocoded to a **centroid** `lat/lng`, then `userCell = latLngToCell(lat, lng, RES)` — identical to the GPS path from there ([Search → Query](./13-search.md#query)). GPS gives coords directly (no geocode); a typed city costs one geocode call.

**Accepted MVP coarseness:** a large city resolves to a single centroid cell, so "Warszawa" is treated as standing at the city centre. This rarely changes the candidate set because the matching radius is already a 30 km disk and the haversine refine is consistent with the stated "around {city}". Precise positioning is what GPS is for. Documented for the user in [Search user-doc](../user-docs/05-search.md).

## Static map

- **Render:** server-proxied via `GET /api/geo/static-map?lat&lng&zoom&radiusKm&approximate` — the route builds the Geoapify Static Maps URL with the **secret key server-side** and streams the PNG bytes (proxy, **not** redirect — a redirect would leak the key in the `Location` header). Never expose the key to the client.
- **Live form preview (debounced):** on `/provider/locations` the same endpoint backs the travel-radius / area preview — the `AppStaticMap` component re-points its `<img src>` (debounced ~400 ms) as the radius slider moves, so we re-render a fresh static image instead of running an interactive map. `radiusKm` draws a translucent reach circle; the browser caches by URL (`cache-control`), so repeated radii are free. This is how we honour "no dynamic maps" while still giving live feedback.
- **Cache (per location):** **deferred to save geo calls.** A saved location is effectively static, so a single cached image at `org/{orgId}/locations/{locationId}/map.png` (mirrors `org/{orgId}/branding/logo.{ext}`, see [File Storage](./23-storage.md)) would be ideal — but the MVP location list shows **no map thumbnail** and the public profile isn't built yet, so nothing currently consumes `location.mapUrl`. We therefore **do not render/cache it on save** (`mapUrl` stays `null`); `renderLocationMap()` + `mapNeedsRerender()` are implemented and reserved to be wired in when the public-profile map lands (render on demand / on first view). The live form preview below is the only active static-map usage.
- **Marker/zoom:** single marker at `lat/lng`, zoom ~14–15 (neighbourhood level); zoom is derived to frame the circle when a `radiusKm` is given.
- **Privacy (`isPublic: false`, home-based providers):** render an **approximate area** — no rooftop pin; a coarse marker / city-centroid view — and hide the exact address publicly (show "serves the {city} area"). Exact pin only for public business locations (`isPublic: true`).
- **Boundary:** image only. No interactive tiles, panning, or pin-drop in MVP. `@takumi-rs/core` (already a dependency) is reserved for certificate/OG rendering and is **not** the basemap renderer.

### Where it shows

- **Provider profile** (`/p/[orgSlug]`, ABOUT tab) — primary placement for `at_location` providers (see [Provider Profile](./12-provider-profile-and-chat.md)).
- **Location management** (`/provider/locations`) — the **live, debounced form preview** while adding/editing (the `AppStaticMap` component re-renders as you adjust); also the failure-handling UI below. The list itself shows **no map thumbnail** (only the uploaded photo or the chip icon) to avoid geo calls. See [Pages & Routes](./35-pages-and-routes.md).
- **`at_location` booking confirmation** — the venue the customer travels to.
- **Never** publicly for `at_client` (that's the client's private home; the provider's own booking detail may show it to assigned staff only).

## Failure handling (no dynamic map)

Without an interactive map there's no pin-drop, so:

1. **Confirm-then-commit.** On save, geocode → show the resolved `displayName` + the static-map preview → provider confirms or re-edits. Provider-side autocomplete (above) prevents most bad geocodes up front.
2. **`geoStatus` gate.** `ok` (rooftop/street, high confidence) → searchable + map shown. `low_confidence` (postcode/city precision) → saved but flagged for confirmation; consider hiding exact public display. `failed` (no result) → not saved as searchable; prompt to fix.
3. **Search-visibility gate.** A location/service whose `geoStatus !== 'ok'` gets no valid `searchCells` and is **excluded from search** (parallels the `organization.status == 'active'` gate in [Search → Query](./13-search.md#query)); surfaced on the onboarding checklist (see [Provider Setup user-doc](../user-docs/17-provider-setup.md)).
4. **Manual coordinate entry (advanced escape hatch).** For un-geocodable addresses (rural PL, new developments), an advanced "enter coordinates" field; sets `geocode.precision = 'manual'`, `geoStatus = 'ok'`, and `h3` is computed from the entered coords. Hidden behind an advanced toggle.

## Re-geocode triggers

Canonical list (recompute is a documented server-side routine, not ad-hoc):

- **`location` address/coords edited** → recompute `lat/lng/h3` and the location's `searchCells` (+ every service referencing it via `atLocation.locationIds`). Done in the location `PATCH` route. (Static-map regeneration is deferred — see Static map → Cache.)
- **`location.areaRadiusKm` changed** (`area`) → recompute that location's `searchCells` + map (no geocode needed).
- **`organization.delivery.atClient.base` changed** → recompute the base `h3` + every `at_client` service's `searchCells`. **`travelRadiusKm` changed** → recompute every `at_client` service's `searchCells` (no geocode). Done in the delivery `PATCH` route.
- **Platform `RES`/`ringsFor` changed** → bulk recompute every `location.h3`, the org base, and all `searchCells` (see [Search → Notes](./13-search.md#notes--tuning)).

## Reverse geocoding

**Skipped in MVP.** "Use my location" gives GPS `lat/lng` used directly for `latLngToCell` — no need to reverse-geocode to a label for matching. A coarse "near {city}" label is a nice-to-have, **parked** (see [Roadmap](./33-post-mvp-roadmap.md)) to avoid extra calls/ToS surface for zero search benefit.

## Multi-country

Rely on the geocoder's **structured component output** rather than parsing addresses ourselves. Store `countryCode`; keep `address`/`displayName` as opaque localized strings (Polish diacritics, Bulgarian Cyrillic must round-trip in UTF-8). Each request is biased by `organization.countryCode` (provider) or the searcher's inferred/selected country.

## Parked (post-MVP)

Dynamic/interactive maps (tiles, pan, pin-drop); searcher address autocomplete; reverse-geocode "near {city}" label; per-km `at_client` distance surcharge (already parked — see [Search](./13-search.md) and [Roadmap](./33-post-mvp-roadmap.md)). External full-text search is parked in [Search](./13-search.md#search-infrastructure-mvp-decision).
