import type { NitroRouteMeta } from 'nitropack/types'

/**
 * Re-types a plain OpenAPI operation object as nitro's `NitroRouteMeta['openAPI']`.
 *
 * Why: nitro bundles an OpenAPI `SchemaObject` type whose `StringSubtype` omits standard
 * JSON-Schema string keywords (`maxLength`, `minLength`, `pattern`). Schema object literals
 * using them therefore fail TS excess-property checks inside `defineRouteMeta`. Routing those
 * literals through this passthrough keeps the keywords in the published spec (Scalar) without
 * resorting to `any`. The target type is derived from the public `NitroRouteMeta`, so it
 * tracks nitro upgrades.
 *
 *   defineRouteMeta({ openAPI: openApiOperation({ tags: [...], requestBody: { ... } }) })
 */
export function openApiOperation(meta: Record<string, unknown>): NonNullable<NitroRouteMeta['openAPI']> {
  return meta as NonNullable<NitroRouteMeta['openAPI']>
}
