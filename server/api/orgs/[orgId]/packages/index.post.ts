import { FieldValue } from 'firebase-admin/firestore'
import type { PackageWriteInput } from '../../../../utils/package'

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Packages'],
    summary: 'Create a package',
    description: 'Owner-only. A bundle of `sessionCount` interchangeable sessions, sold for `price` (integer minor units in the org currency), redeemable against any of `serviceIds` (validated against the org\'s services). See dev-docs/08-packages.md.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'sessionCount', 'serviceIds'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 120 },
              description: { type: 'string', nullable: true, maxLength: 500 },
              sessionCount: { type: 'integer', minimum: 1, maximum: 100 },
              price: { type: 'integer', minimum: 0, description: 'Total package price in minor units.' },
              serviceIds: { type: 'array', items: { type: 'string' }, description: 'Service ids the sessions can be used on (unknown ids dropped; at least one required).' },
              status: { type: 'string', enum: ['active', 'hidden'] }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Created package', content: { 'application/json': { schema: { type: 'object' } } } },
      400: { description: 'Validation error' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Organization not found' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const orgSnap = await adminDb().collection('organizations').doc(orgId).get()
  if (!orgSnap.exists) throw apiError(404, 'errors.api.org.notFound')

  const body = await readBody<PackageWriteInput>(event)
  const doc = await buildPackageDoc(orgId, body)

  const ref = await adminDb().collection('organizations').doc(orgId).collection('packages')
    .add({ ...doc, createdAt: FieldValue.serverTimestamp() })

  return { package: packageResponse(ref.id, doc) }
})
