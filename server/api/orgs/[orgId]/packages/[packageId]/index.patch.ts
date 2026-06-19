import type { PackageDoc, PackageWriteInput } from '../../../../../utils/package'

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Packages'],
    summary: 'Update a package',
    description: 'Owner-only. The edit form sends the full state; unspecified fields fall back to the stored values. `serviceIds` are re-validated against the org\'s services.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'packageId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 120 },
              description: { type: 'string', nullable: true, maxLength: 500 },
              sessionCount: { type: 'integer', minimum: 1, maximum: 100 },
              price: { type: 'integer', minimum: 0 },
              serviceIds: { type: 'array', items: { type: 'string' } },
              status: { type: 'string', enum: ['active', 'hidden'] }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated package', content: { 'application/json': { schema: { type: 'object' } } } },
      400: { description: 'Validation error' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Organization or package not found' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const packageId = getRequiredParam(event, 'packageId')
  await requireOrgRole(event, orgId, ['owner'])

  const ref = adminDb().collection('organizations').doc(orgId).collection('packages').doc(packageId)
  const snap = await ref.get()
  if (!snap.exists) throw apiError(404, 'errors.api.package.notFound')

  const body = await readBody<PackageWriteInput>(event)
  const doc = await buildPackageDoc(orgId, body, snap.data() as PackageDoc)

  await ref.set(doc, { merge: true })
  return { package: packageResponse(packageId, doc) }
})
