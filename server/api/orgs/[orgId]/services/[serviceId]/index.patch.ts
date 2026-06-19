import type { OrgServiceContext, ServiceDoc, ServiceWriteInput } from '../../../../../utils/service'

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Services'],
    summary: 'Update a service',
    description: 'Owner-only. Re-validates against the org delivery gates and recomputes `searchCells`/`languages`. The edit form sends the full state; unspecified fields fall back to the stored values. See dev-docs/13-search.md.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'serviceId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 120 },
              categoryKey: { type: 'string' },
              shortDescription: { type: 'string', nullable: true, maxLength: 160 },
              description: { type: 'string', nullable: true, maxLength: 2000 },
              species: { type: 'array', items: { type: 'string', enum: ['dog', 'cat'] } },
              durationMin: { type: 'integer', minimum: 5, maximum: 1440 },
              operationalBufferMinutes: { type: 'integer', minimum: 0, maximum: 240 },
              paymentMethods: { type: 'array', items: { type: 'string', enum: ['online', 'cash'] } },
              online: { type: 'object', properties: { enabled: { type: 'boolean' } } },
              atClient: { type: 'object', properties: { enabled: { type: 'boolean' } } },
              atLocation: { type: 'object', properties: { enabled: { type: 'boolean' }, locationIds: { type: 'array', items: { type: 'string' } } } },
              pricing: { type: 'object', properties: { online: { type: 'integer' }, at_client: { type: 'integer' }, at_location: { type: 'integer' } } },
              bookingMode: { type: 'string', enum: ['book_now', 'request', 'inquiry'] },
              staffIds: { type: 'array', items: { type: 'string' } },
              requiredPetQuestions: { type: 'array', items: { type: 'string' }, description: 'Handling-catalogue keys the customer must answer.' },
              customQuestions: {
                type: 'array',
                description: 'Provider-authored, per-booking questions.',
                items: {
                  type: 'object',
                  required: ['label', 'type'],
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string', maxLength: 200 },
                    type: { type: 'string', enum: ['short_text', 'long_text', 'single_choice', 'multi_choice'] },
                    options: { type: 'array', items: { type: 'string' } },
                    required: { type: 'boolean' }
                  }
                }
              },
              status: { type: 'string', enum: ['active', 'hidden'] }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated service', content: { 'application/json': { schema: { type: 'object' } } } },
      400: { description: 'Validation error' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Organization or service not found' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const serviceId = getRequiredParam(event, 'serviceId')
  await requireOrgRole(event, orgId, ['owner'])

  const db = adminDb()
  const orgSnap = await db.collection('organizations').doc(orgId).get()
  if (!orgSnap.exists) throw apiError(404, 'errors.api.org.notFound')

  const ref = db.collection('organizations').doc(orgId).collection('services').doc(serviceId)
  const snap = await ref.get()
  if (!snap.exists) throw apiError(404, 'errors.api.service.notFound')

  const body = await readBody<ServiceWriteInput>(event)
  const doc = await buildServiceDoc(orgId, orgSnap.data() as OrgServiceContext, body, snap.data() as ServiceDoc)

  await ref.set(doc, { merge: true })
  return { service: serviceResponse(serviceId, doc) }
})
