// Relative (not `#shared`): that alias is type-only — it does NOT resolve at Nitro runtime.
import type { GeocodeResult, GeoPrecision } from '../../shared/utils/geo'
import { roundCoord } from '../../shared/utils/geo'

/**
 * Geocoding + static-map adapter. Geoapify is the primary provider (ToS permits storing coords
 * indefinitely — the decisive constraint); LocationIQ is the documented drop-in fallback. The
 * rest of the app only ever sees the normalized `GeocodeResult` — it never learns which OSM
 * vendor produced the coords. Server-side only (the key is secret). See dev-docs/36-geocoding-and-maps.md.
 *
 * Config: `GEOAPIFY_API_KEY` (server env, never `NUXT_PUBLIC_*`). When unset, the geocoding calls
 * throw `errors.api.geo.notConfigured` so the UI degrades to manual coordinate entry.
 */

const GEOCODE_BASE = 'https://api.geoapify.com/v1/geocode'
const STATICMAP_BASE = 'https://maps.geoapify.com/v1/staticmap'

// Teal primary / darker teal — matches the Nuxt UI palette (ui-docs/00-ui-basics.md).
const MARKER_COLOR = '%2314b8a6' // #14b8a6
const LINE_COLOR = '%230d9488' // #0d9488
const FILL_COLOR = '%2314b8a6'

interface GeoapifyRank {
  confidence?: number
}
interface GeoapifyProps {
  lat?: number
  lon?: number
  formatted?: string
  city?: string
  town?: string
  village?: string
  postcode?: string
  country_code?: string
  result_type?: string
  rank?: GeoapifyRank
}
interface GeoapifyFeature {
  properties?: GeoapifyProps
}
interface GeoapifyResponse {
  features?: GeoapifyFeature[]
}

interface GeoQueryOptions {
  /** ISO 3166-1 alpha-2 — biases/filters results to the org's (or searcher's) country. */
  countryCode?: string | null
  /** Result-formatting language (defaults to 'pl'). */
  lang?: string
  /** Max suggestions (autocomplete only). */
  limit?: number
}

function apiKey(): string {
  const key = process.env.GEOAPIFY_API_KEY
  if (!key) throw apiError(503, 'errors.api.geo.notConfigured')
  return key
}

/** Geoapify `result_type` → our coarse precision bucket. */
function mapPrecision(resultType: string | undefined): GeoPrecision {
  switch (resultType) {
    case 'building':
    case 'amenity':
      return 'rooftop'
    case 'street':
      return 'street'
    case 'postcode':
      return 'postcode'
    case 'city':
    case 'district':
    case 'suburb':
    case 'state':
      return 'city'
    default:
      return 'approximate'
  }
}

function normalize(props: GeoapifyProps | undefined): GeocodeResult | null {
  if (!props || typeof props.lat !== 'number' || typeof props.lon !== 'number') return null
  return {
    formatted: props.formatted ?? '',
    lat: roundCoord(props.lat),
    lng: roundCoord(props.lon),
    city: props.city ?? props.town ?? props.village ?? null,
    postalCode: props.postcode ?? null,
    countryCode: (props.country_code ?? '').toUpperCase(),
    precision: mapPrecision(props.result_type),
    confidence: typeof props.rank?.confidence === 'number' ? props.rank.confidence : null
  }
}

async function call(endpoint: 'search' | 'autocomplete', query: string, opts: GeoQueryOptions): Promise<GeocodeResult[]> {
  const text = query.trim()
  if (!text) throw apiError(400, 'errors.api.geo.invalidQuery')

  const params = new URLSearchParams({
    text,
    apiKey: apiKey(),
    lang: opts.lang ?? 'pl',
    limit: String(opts.limit ?? (endpoint === 'autocomplete' ? 5 : 1)),
    format: 'geojson'
  })
  const cc = opts.countryCode?.trim().toLowerCase()
  if (cc) params.set(endpoint === 'autocomplete' ? 'bias' : 'filter', `countrycode:${cc}`)

  let res: GeoapifyResponse
  try {
    res = await $fetch<GeoapifyResponse>(`${GEOCODE_BASE}/${endpoint}?${params.toString()}`, {
      retry: 1,
      retryDelay: 300,
      timeout: 8000
    })
  } catch {
    // A transient upstream failure must never 500 — the caller degrades to manual entry / GPS.
    throw apiError(502, 'errors.api.geo.upstream')
  }

  return (res.features ?? []).map(f => normalize(f.properties)).filter((r): r is GeocodeResult => r !== null)
}

/** Forward-geocode a free-text address/city to the single best match (provider save / searcher city). */
export async function geocode(query: string, opts: GeoQueryOptions = {}): Promise<GeocodeResult | null> {
  const results = await call('search', query, { ...opts, limit: 1 })
  return results[0] ?? null
}

/** Address typeahead for the provider location form — structured results with coords attached. */
export async function autocomplete(query: string, opts: GeoQueryOptions = {}): Promise<GeocodeResult[]> {
  return call('autocomplete', query, opts)
}

interface StaticMapOptions {
  lat: number
  lng: number
  /** Fixed zoom; ignored when `radiusKm` is set (zoom is derived to frame the circle). */
  zoom?: number
  /** Draws a translucent reach circle (travel radius / area) and frames the zoom to it. */
  radiusKm?: number | null
  /** Approximate display (home providers / areas): no rooftop pin, just the coarse circle. */
  approximate?: boolean
  width?: number
  height?: number
}

/** Zoom that roughly frames a circle of `radiusKm` at ~600px wide. */
function zoomForRadius(radiusKm: number): number {
  return Math.max(7, Math.min(15, Math.round(14 - Math.log2(Math.max(1, radiusKm)))))
}

/**
 * Build a Geoapify Static Maps URL with the secret key. NEVER returned to the client directly —
 * the `/api/geo/static-map` route streams the bytes so the key stays server-side. `:` and `;`
 * are literal in Geoapify param values; only `#` is percent-encoded (in the colour constants).
 */
export function staticMapUrl(opts: StaticMapOptions): string {
  const { lat, lng } = opts
  const width = opts.width ?? 600
  const height = opts.height ?? 360
  const radiusKm = opts.radiusKm ?? null
  const zoom = radiusKm ? zoomForRadius(radiusKm) : (opts.zoom ?? 15)

  const parts = [
    'style=osm-bright-smooth',
    `width=${width}`,
    `height=${height}`,
    'scaleFactor=2',
    `center=lonlat:${lng},${lat}`,
    `zoom=${zoom}`
  ]
  if (!opts.approximate) {
    parts.push(`marker=lonlat:${lng},${lat};type:material;color:${MARKER_COLOR};size:large`)
  }
  // A circle for the reach radius, or a coarse ~2 km ring for an approximate (privacy) view.
  let circleM = 0
  if (radiusKm) circleM = Math.round(radiusKm * 1000)
  else if (opts.approximate) circleM = 2000
  if (circleM > 0) {
    parts.push(`geometry=circle:${lng},${lat},${circleM};linecolor:${LINE_COLOR};linewidth:2;fillcolor:${FILL_COLOR};fillopacity:0.15`)
  }
  parts.push(`apiKey=${apiKey()}`)
  return `${STATICMAP_BASE}?${parts.join('&')}`
}

/** Fetch the static-map image bytes (for caching a location's map to Storage on geocode success). */
export async function fetchStaticMap(opts: StaticMapOptions): Promise<Buffer> {
  const buf = await $fetch<ArrayBuffer>(staticMapUrl(opts), { responseType: 'arrayBuffer', timeout: 10000 })
  return Buffer.from(buf)
}
