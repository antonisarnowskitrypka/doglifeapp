import type { H3Event } from 'h3'
import type { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore'

/**
 * Authorizes editing a staff member's per-org profile: allowed for the member themselves
 * (their own active membership) OR an Owner of the org. Returns the member ref/snapshot
 * and whether the caller is the owner. See dev-docs/22 (decision: self + owner).
 */
export async function requireMemberEdit(
  event: H3Event,
  organizationId: string,
  membershipId: string
): Promise<{ uid: string, memberRef: DocumentReference, memberSnap: DocumentSnapshot, isOwner: boolean }> {
  const decoded = await requireUser(event)
  const db = adminDb()

  const memberRef = db.collection('organizationMembers').doc(membershipId)
  const memberSnap = await memberRef.get()
  if (!memberSnap.exists || memberSnap.get('organizationId') !== organizationId) {
    throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono członka zespołu.' })
  }

  const isSelf = memberSnap.get('userId') === decoded.uid

  const ownerSnap = await db
    .collection('organizationMembers')
    .where('organizationId', '==', organizationId)
    .where('userId', '==', decoded.uid)
    .where('status', '==', 'active')
    .limit(1)
    .get()
  const isOwner = !ownerSnap.empty && ownerSnap.docs[0].get('role') === 'owner'

  if (!isSelf && !isOwner) {
    throw createError({ statusCode: 403, statusMessage: 'Brak uprawnień do edycji tego profilu.' })
  }

  return { uid: decoded.uid, memberRef, memberSnap, isOwner }
}
