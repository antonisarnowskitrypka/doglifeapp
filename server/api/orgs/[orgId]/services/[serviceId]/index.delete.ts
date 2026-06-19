defineRouteMeta({
  openAPI: {
    tags: ['Services'],
    summary: 'Delete a service',
    description: 'Owner-only. Removes the service. (Existing bookings keep their own snapshot — see dev-docs/05.)',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'serviceId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    responses: {
      200: { description: 'Deleted' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Service not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const serviceId = getRequiredParam(event, 'serviceId')
  await requireOrgRole(event, orgId, ['owner'])

  const ref = adminDb().collection('organizations').doc(orgId).collection('services').doc(serviceId)
  if (!(await ref.get()).exists) throw apiError(404, 'errors.api.service.notFound')

  await ref.delete()
  return { ok: true }
})
