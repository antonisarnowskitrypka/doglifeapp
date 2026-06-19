defineRouteMeta({
  openAPI: {
    tags: ['Geo'],
    summary: 'Forward-geocode a free-text address or city',
    description: 'Authed geocode-on-submit for the provider\'s manual save and (later) searcher city input. Returns the single best match or null. See dev-docs/36-geocoding-and-maps.md.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['query'],
            properties: {
              query: { type: 'string' },
              countryCode: { type: 'string', nullable: true }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Best match or null',
        content: { 'application/json': { schema: { type: 'object', properties: { result: { type: 'object', nullable: true } } } } }
      },
      400: { description: 'Empty query' },
      401: { description: 'Missing or invalid auth token' },
      502: { description: 'Geocoding provider error' },
      503: { description: 'Geocoding not configured (no GEOAPIFY_API_KEY)' }
    }
  }
})

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = await readBody<{ query?: string, countryCode?: string | null }>(event)
  const query = (body.query ?? '').trim()
  if (!query) throw apiError(400, 'errors.api.geo.invalidQuery')

  const result = await geocode(query, { countryCode: body.countryCode })
  return { result }
})
