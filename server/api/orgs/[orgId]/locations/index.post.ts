import { FieldValue } from 'firebase-admin/firestore'
import type { LocationDoc } from '../../../../utils/location'
import type { GeoPointInput } from '../../../../utils/geoPoint'
import { LOCATION_KIND, AREA_RADIUS, SEARCH_RADIUS_KM } from '../../../../../shared/utils/geo'

interface LocationCreateBody extends GeoPointInput {
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
    summary: 'Add an organization location',
    description: 'Owner-only. A fixed address (a venue) or an "in the field" area (city/region centroid + reach). Coordinates are client-supplied (autocomplete pick / /api/geo/geocode / manual); the server derives h3 + geoStatus + searchCells and caches a static map. See dev-docs/36 & 13.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['kind', 'name', 'lat', 'lng'],
            properties: {
              kind: { type: 'string', enum: ['fixed', 'area'] },
              name: { type: 'string', minLength: 1, maxLength: 120 },
              isPublic: { type: 'boolean', description: 'Fixed only — false hides the exact address (home studio).' },
              areaRadiusKm: { type: 'number', minimum: 1, maximum: 60, description: 'Area only — the reach around the centroid.' },
              color: { type: 'string', description: 'Chip color key (see app/utils/chips.ts); reused for calendar chips.' },
              icon: { type: 'string', description: 'Chip icon name (lucide).' },
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
      200: { description: 'Created location', content: { 'application/json': { schema: { type: 'object' } } } },
      400: { description: 'Validation / invalid coordinates' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const body = await readBody<LocationCreateBody>(event)
  const kind = (LOCATION_KIND as readonly string[]).includes(body.kind ?? '') ? (body.kind as 'fixed' | 'area') : 'fixed'
  const name = (body.name ?? '').trim()
  if (!name) throw apiError(400, 'errors.api.location.nameRequired')

  // Area is always coarse + non-public; a fixed venue defaults to public unless explicitly hidden.
  const areaRadiusKm = kind === 'area' ? clampRadius(body.areaRadiusKm, AREA_RADIUS) : null
  const isPublic = kind === 'area' ? false : body.isPublic !== false
  const radiusKm = kind === 'area' ? (areaRadiusKm ?? AREA_RADIUS.default) : SEARCH_RADIUS_KM
  const { color, icon } = resolveChip(body, kind)

  const geo = buildGeoPoint(body, { radiusKm, defaultCountry: body.countryCode || 'PL' })

  const ref = adminDb().collection('organizations').doc(orgId).collection('locations').doc()

  const doc = {
    organizationId: orgId,
    kind,
    name: name.slice(0, 120),
    imageUrl: null,
    color,
    icon,
    isPublic,
    areaRadiusKm,
    ...geo,
    // Per-location static map caching is deferred — the list no longer shows a thumbnail and the
    // public profile will render on demand, so we don't spend a geo call per save. See dev-docs/36.
    mapUrl: null,
    createdAt: FieldValue.serverTimestamp()
  }
  await ref.set(doc)

  return { location: locationResponse(ref.id, doc as LocationDoc) }
})
