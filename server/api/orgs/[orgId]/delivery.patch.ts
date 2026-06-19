import type { GeoPointInput } from '../../../utils/geoPoint'
import { TRAVEL_RADIUS } from '../../../../shared/utils/geo'

const COUNTRY_RE = /^[A-Za-z]{2}$/

interface GateInput { enabled?: unknown }
interface AtClientInput { enabled?: unknown, travelRadiusKm?: unknown, base?: GeoPointInput | null }
interface DeliveryBody {
  countryCode?: string
  online?: GateInput
  atLocation?: GateInput
  atClient?: AtClientInput
}

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Organizations'],
    summary: 'Update org-level delivery configuration',
    description: 'Owner-only. The three delivery gates (online / at_client / at_location) and the SINGLE shared at_client travel base + radius. Gates declare org capability; each service still opts into the enabled modes (see dev-docs/13 & 36). Coordinates are supplied by the client (autocomplete pick / /api/geo/geocode / manual) — this route validates them and derives h3 + geoStatus + searchCells.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              countryCode: { type: 'string', minLength: 2, maxLength: 2 },
              online: { type: 'object', properties: { enabled: { type: 'boolean' } } },
              atLocation: { type: 'object', properties: { enabled: { type: 'boolean' } } },
              atClient: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  travelRadiusKm: { type: 'number', minimum: 1, maximum: 100 },
                  base: {
                    type: 'object',
                    nullable: true,
                    properties: {
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
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated' },
      400: { description: 'Invalid coordinates' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const body = await readBody<DeliveryBody>(event)
  const update: Record<string, unknown> = {}

  const countryCode = body.countryCode && COUNTRY_RE.test(body.countryCode)
    ? body.countryCode.toUpperCase()
    : 'PL'
  if (body.countryCode !== undefined) update.countryCode = countryCode

  // The form always sends the complete delivery state, so we write the whole object.
  const delivery: Record<string, unknown> = {
    online: { enabled: !!body.online?.enabled },
    atLocation: { enabled: !!body.atLocation?.enabled }
  }

  const ac = body.atClient
  const travelRadiusKm = clampRadius(ac?.travelRadiusKm, TRAVEL_RADIUS)
  const base = ac?.base
    ? buildGeoPoint(ac.base, { radiusKm: travelRadiusKm, defaultCountry: countryCode })
    : null
  delivery.atClient = { enabled: !!ac?.enabled, travelRadiusKm, base }

  update.delivery = delivery

  await adminDb().collection('organizations').doc(orgId).set(update, { merge: true })
  return { ok: true, delivery }
})
