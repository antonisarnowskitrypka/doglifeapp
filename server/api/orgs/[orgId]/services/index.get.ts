import type { ServiceDoc } from '../../../../utils/service'

defineRouteMeta({
  openAPI: {
    tags: ['Services'],
    summary: 'List organization services',
    description: 'Readable by any active member. Returns the org\'s single services (omits the internal searchCells/tags).',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: { description: 'Services', content: { 'application/json': { schema: { type: 'object', properties: { services: { type: 'array', items: { type: 'object' } } } } } } },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not a member of this organization' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner', 'staff'])

  const snap = await adminDb()
    .collection('organizations').doc(orgId)
    .collection('services')
    .orderBy('createdAt', 'asc')
    .get()

  return { services: snap.docs.map(d => serviceResponse(d.id, d.data() as ServiceDoc)) }
})
