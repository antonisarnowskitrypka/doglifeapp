defineRouteMeta({
  openAPI: {
    tags: ['Staff'],
    summary: 'List organization members',
    description: 'Owner-only. Returns all members (owner + staff) with their status and a display label.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: {
        description: 'Members',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['members'],
              properties: {
                members: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      membershipId: { type: 'string' },
                      role: { type: 'string', enum: ['owner', 'staff'] },
                      status: { type: 'string', enum: ['active', 'invited', 'pending'] },
                      displayName: { type: 'string', nullable: true },
                      email: { type: 'string', nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRouterParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const db = adminDb()
  const snap = await db.collection('organizationMembers').where('organizationId', '==', orgId).get()

  const members = await Promise.all(snap.docs.map(async (m) => {
    const data = m.data()
    let displayName: string | null = null
    if (data.userId) {
      const u = await db.collection('users').doc(data.userId).get()
      displayName = u.get('displayName') ?? null
    }
    return {
      membershipId: m.id,
      userId: data.userId ?? null,
      role: data.role,
      status: data.status,
      displayName,
      email: data.invitedEmail ?? null,
      shortDescription: data.shortDescription ?? null,
      longDescription: data.longDescription ?? null,
      languages: data.languages ?? [],
      avatarUrl: data.avatarUrl ?? null
    }
  }))

  // Owner first, then by status (active, invited, pending).
  const order = { active: 0, invited: 1, pending: 2 } as Record<string, number>
  members.sort((a, b) =>
    (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0) || (order[a.status] - order[b.status])
  )

  return { members }
})
