import type { PackageDoc } from '../../../../utils/package'

defineRouteMeta({
  openAPI: {
    tags: ['Packages'],
    summary: 'List organization packages',
    description: 'Readable by any active member. Returns the org\'s package definitions (bundles of interchangeable sessions).',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: { description: 'Packages', content: { 'application/json': { schema: { type: 'object', properties: { packages: { type: 'array', items: { type: 'object' } } } } } } },
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
    .collection('packages')
    .orderBy('createdAt', 'asc')
    .get()

  return { packages: snap.docs.map(d => packageResponse(d.id, d.data() as PackageDoc)) }
})
