/**
 * Shared geo constants, pure H3 math and types. Single source of truth for `RES` and the radius
 * bounds so the client preview, the server `searchCells` precompute and the docs can't drift apart.
 *
 * Import notes: **auto-imported in the Nuxt app** (`.vue`/`app/`). In **`server/` it is NOT
 * auto-imported at runtime** — the `#shared` alias is type-only, so server files must import these
 * with a RELATIVE path (`../../shared/utils/geo`), or they hit `X is not defined` at runtime.
 *
 * Deliberately free of `h3-js` (which would otherwise ship to the client): the cell/coverage
 * helpers that need the library live in `server/utils/h3.ts`. See dev-docs/36-geocoding-and-maps.md.
 */

/** Platform-wide H3 resolution. Candidate-retrieval bucket only — haversine is the source of truth. */
export const RES = 6

/** Fixed search radius (km) for `at_location` discovery — a client this close will travel to you. */
export const SEARCH_RADIUS_KM = 30

/** Approximate average hexagon edge length (km) per H3 resolution — drives `ringsFor()`. */
const AVG_HEX_EDGE_KM: Record<number, number> = { 5: 8.54, 6: 3.23, 7: 1.22 }

export function avgHexEdgeKm(res: number = RES): number {
  return AVG_HEX_EDGE_KM[res] ?? AVG_HEX_EDGE_KM[RES] ?? 3.23
}

/**
 * k-ring count covering `km` around a cell: `ceil(km / edge) + 1` safety ring. May slightly
 * over-cover (hex k-ring vs. circle) — harmless, because haversine refines; it never under-covers.
 */
export function ringsFor(km: number, res: number = RES): number {
  return Math.ceil(km / avgHexEdgeKm(res)) + 1
}

/** WGS84 coordinates rounded to 6 dp (~0.11 m) — our stored precision. */
export function roundCoord(n: number): number {
  return Math.round(n * 1e6) / 1e6
}

/** How precisely a query resolved. Drives map detail + the `geoStatus` gate. */
export const GEO_PRECISION = ['rooftop', 'street', 'postcode', 'city', 'approximate', 'manual'] as const
export type GeoPrecision = typeof GEO_PRECISION[number]

/** Search-visibility gate. Only `ok` locations get valid `searchCells` and appear in search. */
export const GEO_STATUS = ['pending', 'ok', 'low_confidence', 'failed'] as const
export type GeoStatus = typeof GEO_STATUS[number]

/** A location is either a fixed address (a venue) or a loose "in the field" area (e.g. a park). */
export const LOCATION_KIND = ['fixed', 'area'] as const
export type LocationKind = typeof LOCATION_KIND[number]

/** Travel-to-client radius slider bounds (km) — the org's single `at_client` reach. */
export const TRAVEL_RADIUS = { min: 1, max: 100, step: 1, default: 15 } as const

/** "In the field" area radius slider bounds (km) — how wide a meet-in-the-area location reaches. */
export const AREA_RADIUS = { min: 1, max: 60, step: 1, default: 10 } as const

export interface Coordinates {
  lat: number
  lng: number
}

/** Normalized geocoder result — what `server/utils/geocode.ts` returns and the client consumes. */
export interface GeocodeResult {
  /** Provider-normalized human label (what we show + store as `displayName`). */
  formatted: string
  lat: number
  lng: number
  city: string | null
  postalCode: string | null
  /** ISO 3166-1 alpha-2. */
  countryCode: string
  precision: GeoPrecision
  /** 0–1 normalized from the provider's rank/confidence; null when unknown. */
  confidence: number | null
}

/** `geoStatus` derived from a geocode result's precision/confidence (server-side gate). */
export function deriveGeoStatus(precision: GeoPrecision, confidence: number | null): GeoStatus {
  if (precision === 'manual') return 'ok'
  if (precision === 'rooftop' || precision === 'street') {
    return confidence === null || confidence >= 0.5 ? 'ok' : 'low_confidence'
  }
  // postcode / city / approximate are coarse — saved, but flagged for confirmation.
  return 'low_confidence'
}
