import { TRAVEL_RADIUS } from '../../../../shared/utils/geo'

defineRouteMeta({
  openAPI: {
    tags: ['Organizations'],
    summary: 'Get organization profile',
    description: 'Readable by any active member of the org. Returns editable profile fields.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: {
        description: 'Organization profile',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                slug: { type: 'string' },
                description: { type: 'string', nullable: true },
                logoUrl: { type: 'string', nullable: true },
                status: { type: 'string' },
                categoryKeys: { type: 'array', items: { type: 'string' } },
                acceptedSpecies: { type: 'array', items: { type: 'string' } },
                companyDetails: { type: 'object', nullable: true },
                currency: { type: 'string', description: 'ISO 4217; one currency per org (see dev-docs/00-conventions.md).' },
                countryCode: { type: 'string', description: 'ISO 3166-1 alpha-2; biases geocoding (see dev-docs/36).' },
                delivery: { type: 'object', description: 'Org-level delivery gates + the shared at_client travel base/radius (see dev-docs/13 & 36).' }
              }
            }
          }
        }
      },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not a member of this organization' },
      404: { description: 'Organization not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner', 'staff'])

  const snap = await adminDb().collection('organizations').doc(orgId).get()
  if (!snap.exists) {
    throw apiError(404, 'errors.api.org.notFound')
  }
  const d = snap.data()!
  return {
    id: snap.id,
    name: d.name ?? '',
    slug: d.slug ?? '',
    description: d.description ?? null,
    logoUrl: d.logoUrl ?? null,
    status: d.status ?? 'draft',
    categoryKeys: d.categoryKeys ?? [],
    acceptedSpecies: d.acceptedSpecies ?? [],
    companyDetails: d.companyDetails ?? null,
    currency: d.currency ?? 'PLN',
    countryCode: d.countryCode ?? 'PL',
    delivery: d.delivery ?? {
      online: { enabled: false },
      atClient: { enabled: false, travelRadiusKm: TRAVEL_RADIUS.default, base: null },
      atLocation: { enabled: false }
    }
  }
})
