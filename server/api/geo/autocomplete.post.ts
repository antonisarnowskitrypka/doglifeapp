defineRouteMeta({
  openAPI: {
    tags: ['Geo'],
    summary: 'Address autocomplete (provider location form)',
    description: 'Authed typeahead. Proxies Geoapify autocomplete server-side and returns structured results with coordinates attached, so the provider\'s selection is stored without a second geocode. See dev-docs/36-geocoding-and-maps.md.',
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
        description: 'Suggestions (may be empty)',
        content: { 'application/json': { schema: { type: 'object', properties: { suggestions: { type: 'array', items: { type: 'object' } } } } } }
      },
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
  // Below 3 chars autocomplete is noise — don't spend a provider quota call.
  if (query.length < 3) return { suggestions: [] }

  const suggestions = await autocomplete(query, { countryCode: body.countryCode })
  return { suggestions }
})
