import { FieldValue } from 'firebase-admin/firestore'

const GRACE_DAYS = 7

defineRouteMeta({
  openAPI: {
    tags: ['Profile'],
    summary: 'Request account deletion (7-day soft schedule)',
    description: 'Flags `users/{uid}` for deletion in 7 days. The client signs out afterwards; signing back in before the deadline cancels it (see /api/auth/sync). The actual, cascade-safe removal is performed later by a super-admin so historical records stay intact.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Deletion scheduled',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['ok', 'scheduledFor'],
              properties: {
                ok: { type: 'boolean' },
                scheduledFor: { type: 'string', format: 'date-time', description: 'ISO timestamp when deletion becomes due.' }
              }
            }
          }
        }
      },
      401: { description: 'Missing or invalid auth token' },
      404: { description: 'User profile not found' }
    }
  }
})

/**
 * Soft-deletes the current account: marks a 7-day deletion schedule and locks it as `pending`.
 * Reversible by signing in again within the window. No destructive Firestore work happens here.
 */
export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const ref = adminDb().collection('users').doc(decoded.uid)
  const snap = await ref.get()
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'User profile not found' })
  }

  const scheduledFor = new Date(Date.now() + GRACE_DAYS * 24 * 60 * 60 * 1000)
  await ref.set({
    deletionStatus: 'pending',
    deletionRequestedAt: FieldValue.serverTimestamp(),
    deletionScheduledFor: scheduledFor
  }, { merge: true })

  return { ok: true, scheduledFor: scheduledFor.toISOString() }
})
