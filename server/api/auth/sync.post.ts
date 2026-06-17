import { FieldValue } from 'firebase-admin/firestore'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Sync the authenticated user into Firestore',
    description: 'Idempotently creates or refreshes the `users/{uid}` document for the signed-in Firebase account. Call right after sign-in/registration.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              locale: { type: 'string', enum: ['pl', 'en', 'bg'], description: 'Preferred locale; defaults to pl.' }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'User synced',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['uid', 'created'],
              properties: {
                uid: { type: 'string' },
                created: { type: 'boolean', description: 'true if the users doc was created on this call.' },
                deletionCancelled: { type: 'boolean', description: 'true if signing in cancelled a pending account deletion.' }
              }
            }
          }
        }
      },
      401: { description: 'Missing or invalid auth token' }
    }
  }
})

/**
 * Mirrors the authenticated Firebase Auth user into our `users` collection (Admin SDK).
 * Called right after sign-in/registration. Idempotent: creates the doc on first sight,
 * otherwise refreshes the mutable identity fields. See dev-docs/20-accounts-and-membership.md.
 */
export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const body = await readBody<{ locale?: string }>(event).catch(() => ({} as { locale?: string }))

  const db = adminDb()
  const ref = db.collection('users').doc(decoded.uid)
  const snap = await ref.get()

  const providers = (decoded.firebase?.identities ? Object.keys(decoded.firebase.identities) : [])
    .map(id => (id === 'email' ? 'password' : id))
  const signInProvider = decoded.firebase?.sign_in_provider
  const authProviders = Array.from(new Set([
    ...providers,
    signInProvider === 'password' ? 'password' : signInProvider
  ].filter((p): p is string => Boolean(p) && p !== 'anonymous')))

  if (!snap.exists) {
    await ref.set({
      email: decoded.email ?? null,
      displayName: decoded.name ?? decoded.email?.split('@')[0] ?? 'Użytkownik',
      avatarUrl: decoded.picture ?? null,
      bio: null,
      phone: decoded.phone_number ?? null,
      phoneVerified: false, // SMS verification deferred (see dev-docs/20)
      locale: body.locale || 'pl',
      notificationPrefs: {},
      authProviders,
      companyDetails: null,
      createdAt: FieldValue.serverTimestamp()
    })
  }

  // Signing in within the 7-day window halts a scheduled deletion (see /api/me/request-deletion).
  const deletionCancelled = snap.exists && snap.get('deletionStatus') === 'pending'

  if (snap.exists) {
    await ref.set({
      email: decoded.email ?? snap.get('email') ?? null,
      avatarUrl: decoded.picture ?? snap.get('avatarUrl') ?? null,
      authProviders,
      ...(deletionCancelled
        ? {
            deletionStatus: FieldValue.delete(),
            deletionRequestedAt: FieldValue.delete(),
            deletionScheduledFor: FieldValue.delete()
          }
        : {})
    }, { merge: true })
  }

  // Bind any `pending` staff invites addressed to this email → `invited` (awaiting accept).
  // See the Staff Invite Flow in dev-docs/20-accounts-and-membership.md.
  if (decoded.email) {
    const pending = await db
      .collection('organizationMembers')
      .where('invitedEmail', '==', decoded.email.toLowerCase())
      .where('status', '==', 'pending')
      .get()
    if (!pending.empty) {
      const batch = db.batch()
      pending.docs.forEach(d => batch.update(d.ref, { userId: decoded.uid, status: 'invited' }))
      await batch.commit()
    }
  }

  return { uid: decoded.uid, created: !snap.exists, deletionCancelled }
})
