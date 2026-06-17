import type { H3Event } from 'h3'
import type { DecodedIdToken } from 'firebase-admin/auth'

export interface OrgMembership {
  membershipId: string
  organizationId: string
  userId: string | null
  role: 'owner' | 'staff'
  status: 'active' | 'invited' | 'pending'
}

/**
 * Verifies the caller is an **active** member of `organizationId` with one of `roles`.
 * Returns the decoded token + the membership. Throws 401 (no auth) or 403 (wrong role).
 * All org-scoped mutations gate on this — authorization lives in server routes, not rules.
 */
export async function requireOrgRole(
  event: H3Event,
  organizationId: string,
  roles: Array<'owner' | 'staff'>
): Promise<{ decoded: DecodedIdToken, membership: OrgMembership }> {
  const decoded = await requireUser(event)
  const db = adminDb()

  const snap = await db
    .collection('organizationMembers')
    .where('organizationId', '==', organizationId)
    .where('userId', '==', decoded.uid)
    .where('status', '==', 'active')
    .limit(1)
    .get()

  const doc = snap.docs[0]
  if (!doc || !roles.includes(doc.get('role'))) {
    throw createError({ statusCode: 403, statusMessage: 'Brak uprawnień w tej organizacji.' })
  }

  return {
    decoded,
    membership: {
      membershipId: doc.id,
      organizationId,
      userId: doc.get('userId'),
      role: doc.get('role'),
      status: doc.get('status')
    }
  }
}
