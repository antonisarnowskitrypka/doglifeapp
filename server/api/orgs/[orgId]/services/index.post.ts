import { FieldValue } from 'firebase-admin/firestore'
import type { OrgServiceContext, ServiceWriteInput } from '../../../../utils/service'

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Services'],
    summary: 'Create a service',
    description: 'Owner-only. A single bookable service (NOT an event/course/package). Delivery modes are gated by `organization.delivery`; prices are integer minor units in the org currency; `searchCells` are precomputed for findability. See dev-docs/13-search.md & 28-service-categories.md.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'categoryKey'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 120 },
              categoryKey: { type: 'string', description: 'Must be one of organization.categoryKeys.' },
              shortDescription: { type: 'string', nullable: true, maxLength: 160, description: 'Always shown next to the name.' },
              description: { type: 'string', nullable: true, maxLength: 2000, description: 'Long description, behind "show more".' },
              species: { type: 'array', items: { type: 'string', enum: ['dog', 'cat'] } },
              durationMin: { type: 'integer', minimum: 5, maximum: 1440 },
              operationalBufferMinutes: { type: 'integer', minimum: 0, maximum: 240, description: 'Rest/prep time after the appointment; calendar reserves duration + buffer.' },
              paymentMethods: { type: 'array', items: { type: 'string', enum: ['online', 'cash'] }, description: 'online is always included.' },
              online: { type: 'object', properties: { enabled: { type: 'boolean' } } },
              atClient: { type: 'object', properties: { enabled: { type: 'boolean' } } },
              atLocation: { type: 'object', properties: { enabled: { type: 'boolean' }, locationIds: { type: 'array', items: { type: 'string' } } } },
              pricing: { type: 'object', description: 'Integer minor units per enabled mode.', properties: { online: { type: 'integer' }, at_client: { type: 'integer' }, at_location: { type: 'integer' } } },
              bookingMode: { type: 'string', enum: ['book_now', 'request', 'inquiry'] },
              staffIds: { type: 'array', items: { type: 'string' }, description: 'Membership ids; empty = all active staff.' },
              status: { type: 'string', enum: ['active', 'hidden'] }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Created service', content: { 'application/json': { schema: { type: 'object' } } } },
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

  const body = await readBody<ServiceWriteInput>(event)
  const doc = await buildServiceDoc(orgId, orgSnap.data() as OrgServiceContext, body)

  const ref = await adminDb().collection('organizations').doc(orgId).collection('services')
    .add({ ...doc, createdAt: FieldValue.serverTimestamp() })

  return { service: serviceResponse(ref.id, doc) }
})
