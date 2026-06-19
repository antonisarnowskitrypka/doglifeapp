import type { LocationDoc } from '../../../../../utils/location'
import type { GeoPointInput } from '../../../../../utils/geoPoint'
import { LOCATION_KIND, AREA_RADIUS, SEARCH_RADIUS_KM } from '../../../../../../shared/utils/geo'

interface LocationPatchBody extends GeoPointInput {
  kind?: string
  name?: string
  isPublic?: boolean
  areaRadiusKm?: number
  color?: string
  icon?: string
}

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Locations'],
    summary: 'Update an organization location',
    description: 'Owner-only. Re-derives h3 + geoStatus + searchCells from the submitted coordinates and re-renders the cached static map only when the coordinates, kind, visibility or area radius change. See dev-docs/36-geocoding-and-maps.md.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'locationId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              kind: { type: 'string', enum: ['fixed', 'area'] },
              name: { type: 'string', minLength: 1, maxLength: 120 },
              isPublic: { type: 'boolean' },
              areaRadiusKm: { type: 'number', minimum: 1, maximum: 60 },
              color: { type: 'string' },
              icon: { type: 'string' },
              address: { type: 'string' },
              lat: { type: 'number' },
              lng: { type: 'number' },
              city: { type: 'string', nullable: true },
              postalCode: { type: 'string', nullable: true },
              countryCode: { type: 'string', nullable: true },
              precision: { type: 'string' },
              confidence: { type: 'number', nullable: true },
              manual: { type: 'boolean' }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated location', content: { 'application/json': { schema: { type: 'object' } } } },
      400: { description: 'Validation / invalid coordinates' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Location not found' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const locationId = getRequiredParam(event, 'locationId')
  await requireOrgRole(event, orgId, ['owner'])

  const ref = adminDb().collection('organizations').doc(orgId).collection('locations').doc(locationId)
  const snap = await ref.get()
  if (!snap.exists) throw apiError(404, 'errors.api.location.notFound')
  const prev = snap.data() as LocationDoc

  const body = await readBody<LocationPatchBody>(event)
  const kind = (LOCATION_KIND as readonly string[]).includes(body.kind ?? '')
    ? (body.kind as 'fixed' | 'area')
    : (prev.kind ?? 'fixed')
  const name = (body.name ?? prev.name ?? '').trim()
  if (!name) throw apiError(400, 'errors.api.location.nameRequired')

  const areaRadiusKm = kind === 'area' ? clampRadius(body.areaRadiusKm ?? prev.areaRadiusKm, AREA_RADIUS) : null
  let isPublic = body.isPublic !== undefined ? !!body.isPublic : (prev.isPublic ?? true)
  if (kind === 'area') isPublic = false // areas are always coarse / non-public
  const radiusKm = kind === 'area' ? (areaRadiusKm ?? AREA_RADIUS.default) : SEARCH_RADIUS_KM
  const { color, icon } = resolveChip(body, kind, prev)

  // Coordinates: take the submitted ones, else keep the stored ones (e.g. a rename-only edit).
  const lat = Number.isFinite(Number(body.lat)) ? Number(body.lat) : prev.lat
  const lng = Number.isFinite(Number(body.lng)) ? Number(body.lng) : prev.lng
  const geo = buildGeoPoint(
    { ...body, lat, lng, address: body.address ?? prev.address, countryCode: body.countryCode ?? prev.countryCode },
    { radiusKm, defaultCountry: prev.countryCode ?? 'PL' }
  )

  // Per-location static map caching is deferred (see dev-docs/36) — keep any previously cached URL,
  // don't spend a geo call regenerating it on edit.
  const mapUrl = prev.mapUrl ?? null

  const doc = { kind, name: name.slice(0, 120), color, icon, isPublic, areaRadiusKm, ...geo, mapUrl }
  await ref.set(doc, { merge: true })

  return { location: locationResponse(locationId, { ...prev, ...doc } as LocationDoc) }
})
