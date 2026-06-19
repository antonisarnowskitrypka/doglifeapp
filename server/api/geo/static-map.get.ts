defineRouteMeta({
  openAPI: {
    tags: ['Geo'],
    summary: 'Static map image (server-proxied)',
    description: 'Streams a Geoapify static-map PNG with the secret key kept server-side. Public on purpose (loaded via <img>/<NuxtImg>, which cannot send a Bearer header); only fixed lat/lng/zoom/radius params, never an arbitrary upstream URL. Used for the location form preview and cached location maps. See dev-docs/36-geocoding-and-maps.md.',
    parameters: [
      { name: 'lat', in: 'query', required: true, schema: { type: 'number' } },
      { name: 'lng', in: 'query', required: true, schema: { type: 'number' } },
      { name: 'zoom', in: 'query', schema: { type: 'integer' } },
      { name: 'radiusKm', in: 'query', description: 'Draws a translucent reach circle and frames the zoom to it.', schema: { type: 'number' } },
      { name: 'approximate', in: 'query', description: 'Coarse privacy view: no exact pin (home providers / areas).', schema: { type: 'boolean' } }
    ],
    responses: {
      200: { description: 'PNG image', content: { 'image/png': {} } },
      400: { description: 'Missing or out-of-range coordinates' },
      502: { description: 'Map provider error' },
      503: { description: 'Maps not configured (no GEOAPIFY_API_KEY)' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const lat = Number(q.lat)
  const lng = Number(q.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw apiError(400, 'errors.api.geo.invalidQuery')
  }

  const radiusRaw = q.radiusKm !== undefined ? Number(q.radiusKm) : NaN
  const zoomRaw = q.zoom !== undefined ? Number(q.zoom) : NaN

  const image = await fetchStaticMap({
    lat,
    lng,
    radiusKm: Number.isFinite(radiusRaw) ? radiusRaw : null,
    zoom: Number.isFinite(zoomRaw) ? zoomRaw : undefined,
    approximate: q.approximate === 'true' || q.approximate === '1'
  })

  setResponseHeader(event, 'content-type', 'image/png')
  setResponseHeader(event, 'cache-control', 'public, max-age=86400')
  return image
})
