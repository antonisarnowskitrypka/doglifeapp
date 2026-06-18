import { FieldValue } from 'firebase-admin/firestore'

defineRouteMeta({
  openAPI: {
    tags: ['Staff'],
    summary: 'Invite a staff member by email',
    description: 'Owner-only. Creates an `organizationMembers` record: `invited` if a user with that email exists (bound to their uid), otherwise `pending` (binds on registration). See dev-docs/20.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email'],
            properties: { email: { type: 'string', format: 'email' } }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Invite created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['membershipId', 'status'],
              properties: {
                membershipId: { type: 'string' },
                status: { type: 'string', enum: ['invited', 'pending'] }
              }
            }
          }
        }
      },
      400: { description: 'Invalid email' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      409: { description: 'Already a member or invited' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const body = await readBody<{ email?: string }>(event)
  const email = (body.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    throw apiError(400, 'errors.api.staff.invalidEmail')
  }

  const db = adminDb()
  const members = db.collection('organizationMembers')

  // Resolve the email to an existing account (if any).
  let userId: string | null = null
  try {
    userId = (await adminAuth().getUserByEmail(email)).uid
  } catch {
    // no account yet → pending invite (userId stays null)
  }

  // Guard against duplicates (active/invited/pending) for this org.
  const [byUser, byEmail] = await Promise.all([
    userId
      ? members.where('organizationId', '==', orgId).where('userId', '==', userId).limit(1).get()
      : Promise.resolve({ empty: true } as { empty: boolean }),
    members.where('organizationId', '==', orgId).where('invitedEmail', '==', email).limit(1).get()
  ])
  if (!byUser.empty || !byEmail.empty) {
    throw apiError(409, 'errors.api.staff.alreadyMember')
  }

  const status = userId ? 'invited' : 'pending'
  const ref = await members.add({
    organizationId: orgId,
    userId,
    role: 'staff',
    status,
    shortDescription: null,
    longDescription: null,
    invitedEmail: email,
    invitedAt: FieldValue.serverTimestamp(),
    acceptedAt: null
  })

  return { membershipId: ref.id, status }
})
