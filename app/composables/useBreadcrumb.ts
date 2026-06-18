// i18n key per route for the side-rail breadcrumb. Reuses `nav.*` labels where they exist.
// Keep in sync with pages.
const ROUTE_KEYS: Record<string, string> = {
  '/': 'nav.opiekun.home',
  '/search': 'nav.opiekun.search',
  '/bookings': 'nav.opiekun.bookings',
  '/pets': 'nav.opiekun.pets',
  '/settings': 'account.title',
  '/notifications': 'nav.notifications',
  '/onboarding': 'nav.createCompany',
  '/provider': 'nav.provider.dashboard',
  '/provider/calendar': 'nav.provider.calendar',
  '/provider/bookings': 'nav.provider.bookings',
  '/provider/finance': 'nav.provider.finance',
  '/provider/settings': 'nav.companySettings.title',
  '/provider/profile': 'nav.companySettings.profile',
  '/provider/me': 'nav.myCard.profile',
  '/provider/reviews': 'nav.myCard.reviews',
  '/provider/staff': 'nav.companySettings.staff',
  '/provider/services': 'nav.companySettings.services',
  '/provider/locations': 'nav.companySettings.locations',
  '/app-settings/notifications': 'nav.appSettings.notifications',
  '/app-settings/language': 'nav.appSettings.language',
  '/app-settings/appearance': 'nav.appSettings.appearance'
}

export function useBreadcrumb() {
  const route = useRoute()
  const ctx = useContextStore()
  const { t } = useI18n()

  const items = computed(() => {
    const isProvider = ctx.activeContext.type === 'org'
    const root = isProvider
      ? { label: t('nav.provider.dashboard'), to: '/provider' }
      : { label: t('nav.opiekun.home'), to: '/' }
    const path = route.path

    if (path === root.to) return [root]

    const key = ROUTE_KEYS[path]
    return key ? [root, { label: t(key) }] : [root]
  })

  return { items }
}
