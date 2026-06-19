import type { LocationDoc } from '../../../../utils/location'

defineRouteMeta({
  openAPI: {
    tags: ['Locations'],
    summary: 'List organization locations',
    description: 'Readable by any active member. Returns fixed venues + "in the field" areas (omits the internal searchCells). See dev-docs/36-geocoding-and-maps.md.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: { description: 'Locations', content: { 'application/json': { schema: { type: 'object', properties: { locations: { type: 'array', items: { type: 'object' } } } } } } },
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
    .collection('locations')
    .orderBy('createdAt', 'asc')
    .get()

  return { locations: snap.docs.map(d => locationResponse(d.id, d.data() as LocationDoc)) }
})
