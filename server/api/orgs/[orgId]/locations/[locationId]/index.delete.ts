defineRouteMeta({
  openAPI: {
    tags: ['Locations'],
    summary: 'Delete an organization location',
    description: 'Owner-only. Removes the location and best-effort deletes its cached map/image from Storage. Note: services still referencing this location must be updated separately (see dev-docs/13).',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'locationId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    responses: {
      200: { description: 'Deleted' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Location not found' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const locationId = getRequiredParam(event, 'locationId')
  await requireOrgRole(event, orgId, ['owner'])

  const ref = adminDb().collection('organizations').doc(orgId).collection('locations').doc(locationId)
  const snap = await ref.get()
  if (!snap.exists) throw apiError(404, 'errors.api.location.notFound')

  await ref.delete()
  // Best-effort cleanup of the cached map + image; orphaned objects must never block the delete.
  try {
    await adminBucket().deleteFiles({ prefix: `org/${orgId}/locations/${locationId}/` })
  } catch {
    // ignore — Storage cleanup is non-critical
  }

  return { ok: true }
})
