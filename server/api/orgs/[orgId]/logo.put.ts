defineRouteMeta({
  openAPI: {
    tags: ['Organizations'],
    summary: 'Upload the organization logo',
    description: 'Owner-only. Multipart image (≤10 MB). Stored at `org/{orgId}/branding/logo.{ext}`; updates `organizations.logoUrl`.',
    security: [{ bearerAuth: [] }],
    parameters: [{ name: 'orgId', in: 'path', required: true, schema: { type: 'string' } }],
    requestBody: {
      required: true,
      content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } }
    },
    responses: {
      200: {
        description: 'Logo uploaded',
        content: { 'application/json': { schema: { type: 'object', required: ['logoUrl'], properties: { logoUrl: { type: 'string' } } } } }
      },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      413: { description: 'File too large' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRouterParam(event, 'orgId')
  await requireOrgRole(event, orgId, ['owner'])

  const { buffer, contentType } = await readUploadedImage(event)
  const logoUrl = await uploadImage({ buffer, contentType, pathBase: `org/${orgId}/branding/logo` })
  await adminDb().collection('organizations').doc(orgId).set({ logoUrl }, { merge: true })

  return { logoUrl }
})
