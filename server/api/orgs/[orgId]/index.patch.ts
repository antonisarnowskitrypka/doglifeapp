const VALID_CATEGORIES = new Set([
  'trainer_behaviourist', 'sport_training', 'physiotherapy', 'grooming',
  'dietitian', 'facility_rental', 'petsitting', 'photography'
])
const VALID_SPECIES = new Set(['dog', 'cat'])

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Organizations'],
    summary: 'Update organization profile',
    description: 'Owner-only. Edits org name, description, categories, accepted species and company (invoice) details. See dev-docs/12 & 22.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 80 },
              description: { type: 'string', nullable: true, maxLength: 2000 },
              categoryKeys: { type: 'array', items: { type: 'string' }, minItems: 1 },
              acceptedSpecies: { type: 'array', items: { type: 'string', enum: ['dog', 'cat'] } },
              companyDetails: {
                type: 'object',
                nullable: true,
                properties: { name: { type: 'string' }, taxId: { type: 'string' }, address: { type: 'string' } }
              }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated' },
      400: { description: 'Validation error' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const body = await readBody<Record<string, unknown>>(event)
  const update: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const v = String(body.name).trim()
    if (v.length < 2) throw apiError(400, 'errors.api.org.nameMin')
    update.name = v.slice(0, 80)
  }
  if (body.description !== undefined) {
    update.description = body.description ? String(body.description).slice(0, 2000) : null
  }
  if (body.categoryKeys !== undefined) {
    const keys = [...new Set((body.categoryKeys as string[]).filter(k => VALID_CATEGORIES.has(k)))]
    if (!keys.length) throw apiError(400, 'errors.api.org.categoryRequired')
    update.categoryKeys = keys
  }
  if (body.acceptedSpecies !== undefined) {
    const sp = [...new Set((body.acceptedSpecies as string[]).filter(s => VALID_SPECIES.has(s)))]
    if (!sp.length) throw apiError(400, 'errors.api.org.speciesRequired')
    update.acceptedSpecies = sp
  }
  if (body.companyDetails !== undefined) {
    const c = body.companyDetails as Record<string, unknown> | null
    update.companyDetails = c
      ? {
          name: String(c.name ?? '').slice(0, 200),
          taxId: String(c.taxId ?? '').slice(0, 50),
          address: String(c.address ?? '').slice(0, 300)
        }
      : null
  }

  if (Object.keys(update).length) {
    await adminDb().collection('organizations').doc(orgId).set(update, { merge: true })
  }

  return { ok: true }
})
