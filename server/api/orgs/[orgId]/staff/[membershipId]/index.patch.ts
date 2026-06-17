defineRouteMeta({
  openAPI: {
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
              languages: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated' },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not the member nor an owner' },
      404: { description: 'Membership not found in this organization' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRouterParam(event, 'orgId')
  const membershipId = getRouterParam(event, 'membershipId')
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

  if (Object.keys(update).length) {
    await memberRef.set(update, { merge: true })
  }

  return { ok: true }
})
