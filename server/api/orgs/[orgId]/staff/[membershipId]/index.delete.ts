defineRouteMeta({
  openAPI: {
    tags: ['Staff'],
    summary: 'Remove a staff member or revoke an invite',
    description: 'Owner-only. Deletes a staff/invited/pending membership. The owner membership cannot be removed here. See dev-docs/20.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'membershipId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    responses: {
      200: { description: 'Removed' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Membership not found in this organization' },
      409: { description: 'Cannot remove the owner' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const membershipId = getRequiredParam(event, 'membershipId')
  await requireOrgRole(event, orgId, ['owner'])

  const db = adminDb()
  const ref = db.collection('organizationMembers').doc(membershipId)
  const snap = await ref.get()

  if (!snap.exists || snap.get('organizationId') !== orgId) {
    throw apiError(404, 'errors.api.staff.notFound')
  }
  if (snap.get('role') === 'owner') {
    throw apiError(409, 'errors.api.staff.cannotRemoveOwner')
  }

  await ref.delete()
  return { ok: true }
})
