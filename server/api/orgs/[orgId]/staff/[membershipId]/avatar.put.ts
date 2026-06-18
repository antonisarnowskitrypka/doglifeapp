defineRouteMeta({
  openAPI: {
    tags: ['Staff'],
    summary: 'Upload a staff member\'s org-scoped avatar',
    description: 'Editable by the member themselves or an Owner (e.g. a photo in the company shirt). Distinct from the personal user avatar; stored at `org/{orgId}/staff/{membershipId}/avatar.{ext}` → `organizationMembers.avatarUrl`.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'membershipId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      required: true,
      content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } }
    },
    responses: {
      200: {
        description: 'Avatar uploaded',
        content: { 'application/json': { schema: { type: 'object', required: ['avatarUrl'], properties: { avatarUrl: { type: 'string' } } } } }
      },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not the member nor an owner' },
      404: { description: 'Membership not found in this organization' },
      413: { description: 'File too large' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const membershipId = getRequiredParam(event, 'membershipId')
  const { memberRef } = await requireMemberEdit(event, orgId, membershipId)

  const { buffer, contentType } = await readUploadedImage(event)
  const avatarUrl = await uploadImage({ buffer, contentType, pathBase: `org/${orgId}/staff/${membershipId}/avatar` })
  await memberRef.set({ avatarUrl }, { merge: true })

  return { avatarUrl }
})
