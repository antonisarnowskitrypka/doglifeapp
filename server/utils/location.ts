import type { LocationKind, GeoPrecision, GeoStatus } from '../../shared/utils/geo'

/**
 * Server-side helpers for organization locations (subcollection `organizations/{orgId}/locations`).
 * A location is either a fixed address (a venue clients travel to) or an `area` ("in the field",
 * e.g. meet in a park) — a city/region centroid with a provider-defined reach. See dev-docs/36 & 13.
 */

/** The persisted location document shape (the geo block comes from `buildGeoPoint`). */
export interface LocationDoc {
  kind?: LocationKind
  name?: string
  imageUrl?: string | null
  color?: string
  icon?: string
  isPublic?: boolean
  areaRadiusKm?: number | null
  address?: string
  displayName?: string
  city?: string | null
  postalCode?: string | null
  countryCode?: string
  lat?: number | null
  lng?: number | null
  geocode?: { precision?: GeoPrecision } | null
  geoStatus?: GeoStatus
  mapUrl?: string | null
}

/** Resolve the chip color + icon from a write body, defaulting to `prev` (edit) or kind defaults. */
export function resolveChip(
  input: { color?: string, icon?: string },
  kind: string,
  prev?: { color?: string, icon?: string }
): { color: string, icon: string } {
  const color = typeof input.color === 'string' && input.color.trim()
    ? input.color.trim().slice(0, 32)
    : (prev?.color ?? 'teal')
  let icon = typeof input.icon === 'string' && input.icon.trim()
    ? input.icon.trim().slice(0, 64)
    : (prev?.icon ?? '')
  if (!icon) icon = kind === 'area' ? 'i-lucide-trees' : 'i-lucide-map-pin'
  return { color, icon }
}

/**
 * RESERVED (not currently called — per-location map caching is deferred to save geo calls; the
 * list shows no thumbnail and the public profile will render on demand). Whether a saved location's
 * cached static map must be re-rendered (coords/kind/visibility/area). See dev-docs/36.
 */
export function mapNeedsRerender(
  prev: LocationDoc,
  next: { lat: number, lng: number, kind: string, isPublic: boolean, areaRadiusKm: number | null }
): boolean {
  return next.lat !== prev.lat
    || next.lng !== prev.lng
    || next.kind !== prev.kind
    || next.isPublic !== prev.isPublic
    || (next.kind === 'area' && next.areaRadiusKm !== prev.areaRadiusKm)
    || !prev.mapUrl
}

/** Curated client response — omits the heavy internal `searchCells` and geocode audit fields. */
export function locationResponse(id: string, d: LocationDoc) {
  return {
    id,
    kind: d.kind ?? 'fixed',
    name: d.name ?? '',
    imageUrl: d.imageUrl ?? null,
    color: d.color ?? 'teal',
    icon: d.icon ?? (d.kind === 'area' ? 'i-lucide-trees' : 'i-lucide-map-pin'),
    isPublic: d.isPublic ?? true,
    areaRadiusKm: d.areaRadiusKm ?? null,
    address: d.address ?? '',
    displayName: d.displayName ?? '',
    city: d.city ?? null,
    postalCode: d.postalCode ?? null,
    countryCode: d.countryCode ?? 'PL',
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    precision: d.geocode?.precision ?? null,
    geoStatus: d.geoStatus ?? 'pending',
    mapUrl: d.mapUrl ?? null
  }
}

/**
 * RESERVED (not currently called — per-location map caching is deferred to save geo calls; wire
 * this in when the public-profile map is built). Renders a location's static map once (on geocode
 * success / coord change) and caches it to Storage at `org/{orgId}/locations/{locationId}/map.png`
 * — mirrors the logo convention
 * (dev-docs/23-storage.md). Best-effort: if maps aren't configured or the provider is down, the
 * location still saves with `mapUrl: null` and the image fills in on the next edit.
 *
 * Privacy: `area` and non-public (home) locations render an APPROXIMATE view (no rooftop pin);
 * only public fixed venues get the exact marker.
 */
export async function renderLocationMap(opts: {
  orgId: string
  locationId: string
  lat: number
  lng: number
  kind: LocationKind
  isPublic: boolean
  areaRadiusKm: number | null
}): Promise<string | null> {
  try {
    const approximate = opts.kind === 'area' || !opts.isPublic
    const radiusKm = opts.kind === 'area' ? opts.areaRadiusKm : null
    const buffer = await fetchStaticMap({ lat: opts.lat, lng: opts.lng, approximate, radiusKm, zoom: 15 })
    return await uploadImage({
      buffer,
      contentType: 'image/png',
      pathBase: `org/${opts.orgId}/locations/${opts.locationId}/map`
    })
  } catch {
    return null
  }
}
