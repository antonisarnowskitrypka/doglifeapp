defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Current user profile + organization memberships',
    description: 'The single source the app shell uses to build the context switcher (Opiekun + one entry per active membership).',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Profile and active memberships',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['user', 'memberships'],
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string', nullable: true },
                    displayName: { type: 'string' },
                    avatarUrl: { type: 'string', nullable: true },
                    phone: { type: 'string', nullable: true },
                    phoneVerified: { type: 'boolean' },
                    locale: { type: 'string' },
                    authProviders: { type: 'array', items: { type: 'string' } }
                  }
                },
                memberships: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      membershipId: { type: 'string' },
                      organizationId: { type: 'string' },
                      organizationName: { type: 'string' },
                      organizationStatus: { type: 'string', enum: ['draft', 'active', 'suspended'] },
                      role: { type: 'string', enum: ['owner', 'staff'] }
                    }
                  }
                },
                invites: {
                  type: 'array',
                  description: 'Pending staff invitations addressed to this user.',
                  items: {
                    type: 'object',
                    properties: {
                      membershipId: { type: 'string' },
                      organizationId: { type: 'string' },
                      organizationName: { type: 'string' },
                      role: { type: 'string', enum: ['owner', 'staff'] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      401: { description: 'Missing or invalid auth token' },
      404: { description: 'Auth user exists but profile not yet synced (call /api/auth/sync first)' }
    }
  }
})

/**
 * Returns the current user's profile + their organization memberships (Admin SDK).
 * This is the single source the app shell uses to build the context switcher
 * (Opiekun + one entry per active membership). See ui-docs/02-app-shell-and-navigation.md.
 */
export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const db = adminDb()

  const userSnap = await db.collection('users').doc(decoded.uid).get()
  if (!userSnap.exists) {
    // Auth user exists but not yet mirrored — let the client run /api/auth/sync first.
    throw createError({ statusCode: 404, statusMessage: 'User profile not found' })
  }

  const membersSnap = await db
    .collection('organizationMembers')
    .where('userId', '==', decoded.uid)
    .where('status', '==', 'active')
    .get()

  const orgName = async (organizationId: string) =>
    (await db.collection('organizations').doc(organizationId).get()).get('name') ?? 'Organizacja'

  // Active memberships → the context switcher + the member's own per-org profile.
  const memberships = await Promise.all(membersSnap.docs.map(async (m) => {
    const data = m.data()
    const orgSnap = await db.collection('organizations').doc(data.organizationId).get()
    return {
      membershipId: m.id,
      organizationId: data.organizationId,
      organizationName: orgSnap.get('name') ?? 'Organizacja',
      organizationStatus: orgSnap.get('status') ?? 'draft',
      organizationLogoUrl: orgSnap.get('logoUrl') ?? null,
      role: data.role,
      shortDescription: data.shortDescription ?? null,
      longDescription: data.longDescription ?? null,
      languages: data.languages ?? [],
      avatarUrl: data.avatarUrl ?? null,
      color: data.color ?? null
    }
  }))

  // Pending invitations addressed to this user (awaiting acceptance).
  const invitesSnap = await db
    .collection('organizationMembers')
    .where('userId', '==', decoded.uid)
    .where('status', '==', 'invited')
    .get()

  const invites = await Promise.all(invitesSnap.docs.map(async (m) => {
    const data = m.data()
    return {
      membershipId: m.id,
      organizationId: data.organizationId,
      organizationName: await orgName(data.organizationId),
      role: data.role
    }
  }))

  return {
    user: { id: userSnap.id, ...userSnap.data() },
    memberships,
    invites
  }
})
