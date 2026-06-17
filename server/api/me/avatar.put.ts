defineRouteMeta({
  openAPI: {
    tags: ['Profile'],
    summary: 'Upload the current user\'s avatar',
    description: 'Multipart image (JPG/PNG/WEBP/HEIC, ≤10 MB). Stored at `users/{uid}/avatar.{ext}`; updates `users.avatarUrl`.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } }
    },
    responses: {
      200: {
        description: 'Avatar uploaded',
        content: { 'application/json': { schema: { type: 'object', required: ['avatarUrl'], properties: { avatarUrl: { type: 'string' } } } } }
      },
      400: { description: 'Missing/invalid file' },
      401: { description: 'Missing or invalid auth token' },
      413: { description: 'File too large' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const { buffer, contentType } = await readUploadedImage(event)

  const avatarUrl = await uploadImage({ buffer, contentType, pathBase: `users/${decoded.uid}/avatar` })
  await adminDb().collection('users').doc(decoded.uid).set({ avatarUrl }, { merge: true })

  return { avatarUrl }
})
