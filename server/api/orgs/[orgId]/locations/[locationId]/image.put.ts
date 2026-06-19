defineRouteMeta({
  openAPI: {
    tags: ['Locations'],
    summary: 'Upload a location photo',
    description: 'Owner-only. Multipart image (≤10 MB). Stored at `org/{orgId}/locations/{locationId}/image.{ext}`; updates the location\'s `imageUrl`. See dev-docs/23-storage.md.',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'orgId', in: 'path', required: true, schema: { type: 'string' } },
      { name: 'locationId', in: 'path', required: true, schema: { type: 'string' } }
    ],
    requestBody: {
      required: true,
      content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } }
    },
    responses: {
      200: { description: 'Image uploaded', content: { 'application/json': { schema: { type: 'object', required: ['imageUrl'], properties: { imageUrl: { type: 'string' } } } } } },
      401: { description: 'Missing or invalid auth token' },
      403: { description: 'Not an owner of this organization' },
      404: { description: 'Location not found' },
      413: { description: 'File too large' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const orgId = getRequiredParam(event, 'orgId')
  const locationId = getRequiredParam(event, 'locationId')
  await requireOrgRole(event, orgId, ['owner'])

  const ref = adminDb().collection('organizations').doc(orgId).collection('locations').doc(locationId)
  if (!(await ref.get()).exists) throw apiError(404, 'errors.api.location.notFound')

  const { buffer, contentType } = await readUploadedImage(event)
  const imageUrl = await uploadImage({ buffer, contentType, pathBase: `org/${orgId}/locations/${locationId}/image` })
  await ref.set({ imageUrl }, { merge: true })

  return { imageUrl }
})
