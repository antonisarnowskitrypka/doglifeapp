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
                companyDetails: { type: 'object', nullable: true }
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
  const orgId = getRouterParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner', 'staff'])

  const snap = await adminDb().collection('organizations').doc(orgId).get()
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono firmy.' })
  }
  const d = snap.data()
  return {
    id: snap.id,
    name: d.name ?? '',
    slug: d.slug ?? '',
    description: d.description ?? null,
    logoUrl: d.logoUrl ?? null,
    status: d.status ?? 'draft',
    categoryKeys: d.categoryKeys ?? [],
    acceptedSpecies: d.acceptedSpecies ?? [],
    companyDetails: d.companyDetails ?? null
  }
})
