import { FieldValue } from 'firebase-admin/firestore'
// Relative (not `#shared`): that alias is type-only — it does NOT resolve at Nitro runtime.
import type { GeoPrecision, GeoStatus } from '../../shared/utils/geo'
import { deriveGeoStatus, roundCoord } from '../../shared/utils/geo'

/**
 * Client-supplied geocode (from an autocomplete pick, `/api/geo/geocode`, or manual entry).
 * The save routes NEVER geocode themselves — geocoding happens during the form's confirm-then-commit
 * flow via the `/api/geo/*` routes; the client commits the chosen coordinates here. See dev-docs/36.
 */
export interface GeoPointInput {
  address?: string | null
  displayName?: string | null
  lat?: unknown
  lng?: unknown
  city?: string | null
  postalCode?: string | null
  countryCode?: string | null
  precision?: GeoPrecision
  confidence?: number | null
  sourceQuery?: string | null
  /** Advanced escape hatch: coordinates entered by hand for an un-geocodable address. */
  manual?: boolean
}

export interface StoredGeoPoint {
  address: string
  displayName: string
  city: string | null
  postalCode: string | null
  countryCode: string
  lat: number
  lng: number
  h3: string
  geocode: {
    provider: string
    precision: GeoPrecision
    confidence: number | null
    sourceQuery: string | null
    geocodedAt: FieldValue
  }
  geoStatus: GeoStatus
  searchCells: string[]
}

/**
 * Validates client coordinates and derives the persisted geo block: rounded `lat/lng`, the H3
 * `h3` cell, the `geoStatus` gate, and the `searchCells` coverage for `radiusKm`. Throws 400 on
 * out-of-range coordinates. `cellFor`/`searchCellsFor` come from `server/utils/h3.ts`.
 */
export function buildGeoPoint(input: GeoPointInput, opts: { radiusKm: number, defaultCountry: string }): StoredGeoPoint {
  const lat = Number(input.lat)
  const lng = Number(input.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw apiError(400, 'errors.api.geo.invalidCoords')
  }

  const rLat = roundCoord(lat)
  const rLng = roundCoord(lng)
  const precision: GeoPrecision = input.manual ? 'manual' : (input.precision ?? 'street')
  const confidence = typeof input.confidence === 'number' ? input.confidence : null
  const address = String(input.address ?? '').slice(0, 300)

  return {
    address,
    displayName: String(input.displayName ?? address).slice(0, 300),
    city: input.city ? String(input.city).slice(0, 120) : null,
    postalCode: input.postalCode ? String(input.postalCode).slice(0, 20) : null,
    countryCode: (input.countryCode || opts.defaultCountry || 'PL').toUpperCase().slice(0, 2),
    lat: rLat,
    lng: rLng,
    h3: cellFor(rLat, rLng),
    geocode: {
      provider: 'geoapify',
      precision,
      confidence,
      sourceQuery: input.sourceQuery ? String(input.sourceQuery).slice(0, 300) : null,
      geocodedAt: FieldValue.serverTimestamp()
    },
    geoStatus: deriveGeoStatus(precision, confidence),
    searchCells: searchCellsFor(rLat, rLng, opts.radiusKm)
  }
}

/** Clamp + round a radius slider value (km) into bounds. */
export function clampRadius(value: unknown, bounds: { min: number, max: number, default: number }): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return bounds.default
  return Math.min(bounds.max, Math.max(bounds.min, n))
}
