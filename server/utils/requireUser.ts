import type { H3Event } from 'h3'
import type { DecodedIdToken } from 'firebase-admin/auth'

/**
 * Verifies the Firebase ID token from the `Authorization: Bearer <token>` header and
 * returns the decoded token. Throws 401 if missing/invalid. All authed server routes
 * gate on this — clients attach the token via the `useAuthFetch` composable.
 */
export async function requireUser(event: H3Event): Promise<DecodedIdToken> {
  const header = getHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing auth token' })
  }

  try {
    return await adminAuth().verifyIdToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid auth token' })
  }
}
