/**
 * Resolves a translated message from a server ($fetch) error. Server routes throw via the
 * `apiError()` util, which carries an `i18nKey` (+ params) in the error payload; we translate
 * it against the `errors.api.*` catalog. Falls back to `fallbackKey` (default `errors.generic`).
 * For Firebase Auth (client) errors use `useAuthError()` instead.
 */
export function useApiError() {
  const { t, te } = useI18n()

  function apiErrorMessage(e: unknown, fallbackKey = 'errors.generic'): string {
    const err = e as {
      statusMessage?: string
      data?: {
        i18nKey?: string
        i18nParams?: Record<string, unknown>
        statusMessage?: string
        data?: { i18nKey?: string, i18nParams?: Record<string, unknown> }
      }
    }
    const body = err?.data
    // h3 nests createError `data` under the response body's `data`; cover both shapes.
    const key = body?.data?.i18nKey ?? body?.i18nKey
    const params = body?.data?.i18nParams ?? body?.i18nParams
    if (key && te(key)) return t(key, params ?? {})
    // statusMessage may itself be the key (apiError sets it as a dev fallback).
    const sm = err?.statusMessage ?? body?.statusMessage
    if (sm && te(sm)) return t(sm)
    return t(fallbackKey)
  }

  return { apiErrorMessage }
}
