import { FieldValue } from 'firebase-admin/firestore'

defineRouteMeta({
  openAPI: {
    tags: ['Staff'],
    summary: 'Accept a staff invitation',
    description: 'The invited user accepts their `invited` membership → `active` (binds `acceptedAt`). See dev-docs/20.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'membershipId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: {
        description: 'Invitation accepted',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['membershipId', 'organizationId'],
              properties: {
                membershipId: { type: 'string' },
                organizationId: { type: 'string' }
              }
            }
          }
        }
      },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not the invited user' },
      404: { description: 'Invite not found or not pending acceptance' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const membershipId = getRequiredParam(event, 'membershipId')

  const db = adminDb()
  const ref = db.collection('organizationMembers').doc(membershipId)
  const snap = await ref.get()

  if (!snap.exists || snap.get('status') !== 'invited') {
    throw apiError(404, 'errors.api.invite.notFound')
  }
  if (snap.get('userId') !== decoded.uid) {
    throw apiError(403, 'errors.api.invite.notYours')
  }

  await ref.update({ status: 'active', acceptedAt: FieldValue.serverTimestamp() })

  return { membershipId, organizationId: snap.get('organizationId') }
})
