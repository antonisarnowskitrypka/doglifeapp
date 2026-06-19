defineRouteMeta({
  openAPI: {
    tags: ['Staff'],
    summary: 'Chip colors used by org members',
    description: 'Any active member. Returns each member\'s chip color (membershipId + color only, no PII) so the personal color picker can disable colors already taken by others.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    responses: {
      200: { description: 'Used colors', content: { 'application/json': { schema: { type: 'object', properties: { used: { type: 'array', items: { type: 'object', properties: { membershipId: { type: 'string' }, color: { type: 'string' } } } } } } } } },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not a member of this organization' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner', 'staff'])

  const snap = await adminDb().collection('organizationMembers').where('organizationId', '==', orgId).get()
  const used = snap.docs
    .filter(d => d.get('color'))
    .map(d => ({ membershipId: d.id, color: d.get('color') as string }))

  return { used }
})
