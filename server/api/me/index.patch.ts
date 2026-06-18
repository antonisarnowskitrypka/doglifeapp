const LOCALES = new Set(['pl', 'en', 'bg'])

defineRouteMeta({
  openAPI: openApiOperation({
    tags: ['Profile'],
    summary: 'Update the current user\'s profile',
    description: 'Updates editable fields on `users`: display name, bio, phone, locale, and company (invoice) details. See dev-docs/20.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              displayName: { type: 'string', maxLength: 80 },
              bio: { type: 'string', nullable: true, maxLength: 1000 },
              phone: { type: 'string', nullable: true, maxLength: 32 },
              locale: { type: 'string', enum: ['pl', 'en', 'bg'] },
              companyDetails: {
                type: 'object',
                nullable: true,
                properties: {
                  name: { type: 'string' },
                  taxId: { type: 'string' },
                  address: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    responses: {
      200: { description: 'Updated' },
      400: { description: 'Validation error' },
      401: { description: 'Missing or invalid auth token' }
    }
  })
})

export default defineEventHandler(async (event) => {
  const decoded = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)

  const update: Record<string, unknown> = {}

  if (body.displayName !== undefined) {
    const v = String(body.displayName).trim()
    if (v.length < 1) throw apiError(400, 'errors.api.profile.nameEmpty')
    update.displayName = v.slice(0, 80)
  }
  if (body.bio !== undefined) update.bio = body.bio ? String(body.bio).slice(0, 1000) : null
  if (body.phone !== undefined) update.phone = body.phone ? String(body.phone).trim().slice(0, 32) : null
  if (body.locale !== undefined) {
    if (!LOCALES.has(String(body.locale))) throw apiError(400, 'errors.api.profile.unsupportedLocale')
    update.locale = body.locale
  }
  if (body.companyDetails !== undefined) {
    const c = body.companyDetails as Record<string, unknown> | null
    update.companyDetails = c
      ? {
          name: String(c.name ?? '').slice(0, 200),
          taxId: String(c.taxId ?? '').slice(0, 50),
          address: String(c.address ?? '').slice(0, 300)
        }
      : null
  }

  if (Object.keys(update).length) {
    await adminDb().collection('users').doc(decoded.uid).set(update, { merge: true })
  }

  return { ok: true }
})
