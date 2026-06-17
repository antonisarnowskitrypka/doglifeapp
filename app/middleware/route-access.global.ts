/**
 * Global access guard. Each page declares its scope via `definePageMeta({ context })`:
 *   - 'public'   — usable without login (e.g. /search, /settings, and "/" as an invite)
 *   - 'shared'   — any logged-in user, any context (e.g. /settings account, /notifications, /onboarding)
 *   - 'opiekun'  — guardian-context routes (e.g. /bookings, /pets)
 *   - 'provider' — active-org routes (/provider/*)
 *
 * Context type is read straight from the `dl-context` cookie (no /api/me round-trip), so the
 * common, matching case is instant and the shell's skeleton handles membership loading.
 * Cross-context deep-links auto-switch when the user has a matching membership (decision: ui-docs/02).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Auth state is client-side until SSR session cookies are wired (dev-docs/10).
  if (import.meta.server) return

  const scope = (to.meta.context as string) || 'public'
  const activeKey = useCookie<string>('dl-context').value
  const ctxType = activeKey && activeKey !== 'opiekun' ? 'org' : 'opiekun'

  // "/" — invite for anon; guardian dashboard for Opiekun; redirect to /provider in org context.
  if (to.path === '/') {
    const user = await getCurrentUser()
    if (user && ctxType === 'org') return navigateTo('/provider')
    return
  }

  if (scope === 'public') return

  // Anonymous users are NOT redirected — the shell renders an AuthTeaser on login-required
  // pages (no forced auth modal). Only logged-in users need context resolution below.
  const user = await getCurrentUser()
  if (!user) return

  if (scope === 'shared') return

  const ctx = useContextStore()

  if (scope === 'opiekun') {
    // Opiekun is always available — auto-switch out of an org context.
    if (ctxType === 'org') ctx.setContext('opiekun')
    return
  }

  if (scope === 'provider') {
    if (ctxType === 'org') return // already in an org context

    // In Opiekun context but opening a provider route: switch into an org if the user has one,
    // preferring the last org they worked in (dl-last-org).
    if (!ctx.loaded) await ctx.load()
    const key = ctx.resolveProviderKey()
    if (key) {
      ctx.setContext(key)
      return
    }
    // No company yet → send to the creator.
    return navigateTo('/onboarding')
  }
})
