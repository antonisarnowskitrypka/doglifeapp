import type { H3Event } from 'h3'

/**
 * Reads a route parameter that is structurally guaranteed by the route path (e.g. `[orgId]`),
 * returning a non-optional `string`. Throws 400 if it's somehow absent (shouldn't happen for a
 * matched route) — a technical guard, not a user-facing message.
 */
export function getRequiredParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)
  if (!value) {
    throw createError({ statusCode: 400, statusMessage: `Missing route parameter: ${name}` })
  }
  return value
}
