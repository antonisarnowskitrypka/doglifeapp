defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Staff'],
    summary: 'Update a staff member\'s per-org profile',
    description: 'Editable by the member themselves or an Owner. Sets the professional blurb (short/long) and spoken languages. See dev-docs/20 & 22.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'membershipId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              shortDescription: { type: 'string', nullable: true, maxLength: 160 },
              longDescription: { type: 'string', nullable: true, maxLength: 2000 },
              languages: { type: 'array', items: { type: 'string' } },
              color: { type: 'string', nullable: true, description: 'Personal chip color key — must be unique within the org.' }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not the member nor an owner' },
      404: { description: 'Membership not found in this organization' },
      409: { description: 'Chip color already used by another member' }
    }
  })
})

/** Validate a chip color is unique within the org (index-free scan; orgs have few members). */
async function uniqueColor(orgId: string, membershipId: string, raw: unknown): Promise<string | null> {
  const color = raw ? String(raw).slice(0, 32) : null
  if (!color) return null
  const members = await adminDb().collection('organizationMembers').where('organizationId', '==', orgId).get()
  if (members.docs.some(d => d.id !== membershipId && d.get('color') === color)) {
    throw apiError(409, 'errors.api.staff.colorTaken')
  }
  return color
}

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const membershipId = getRequiredParam(event, 'membershipId')
  const { memberRef } = await requireMemberEdit(event, orgId, membershipId)

  const body = await readBody<Record<string, unknown>>(event)
  const update: Record<string, unknown> = {}

  if (body.shortDescription !== undefined) {
    update.shortDescription = body.shortDescription ? String(body.shortDescription).slice(0, 160) : null
  }
  if (body.longDescription !== undefined) {
    update.longDescription = body.longDescription ? String(body.longDescription).slice(0, 2000) : null
  }
  if (body.languages !== undefined) {
    update.languages = [...new Set((body.languages as string[]).map(l => String(l).trim().toLowerCase()).filter(Boolean))].slice(0, 20)
  }
  if (body.color !== undefined) {
    update.color = await uniqueColor(orgId, membershipId, body.color)
  }

  if (Object.keys(update).length) {
    await memberRef.set(update, { merge: true })
  }

  return { ok: true }
})
