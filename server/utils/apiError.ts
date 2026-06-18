/**
 * `createError` variant that carries an i18n key for the CLIENT to translate — keeps
 * user-facing copy out of server code (the server has no vue-i18n). The client reads
 * `error.data.i18nKey` via the `useApiError()` composable and resolves it against the
 * `errors.api.*` catalog; `statusMessage` is set to the key itself as a stable,
 * greppable dev fallback. See dev-docs/00-conventions.md#i18n.
 *
 * Usage: `throw apiError(404, 'errors.api.staff.notFound')`
 */
export function apiError(statusCode: number, key: string, params?: Record<string, unknown>) {
  return createError({
    statusCode,
    statusMessage: key,
    data: { i18nKey: key, i18nParams: params }
  })
}
