// Human labels per route for the side-rail breadcrumb. Keep in sync with pages.
const LABELS: Record<string, string> = {
  '/': 'Start',
  '/search': 'Szukaj',
  '/bookings': 'Rezerwacje',
  '/pets': 'Zwierzaki',
  '/settings': 'Ustawienia',
  '/notifications': 'Powiadomienia',
  '/onboarding': 'Załóż firmę',
  '/provider': 'Pulpit',
  '/provider/calendar': 'Kalendarz',
  '/provider/bookings': 'Rezerwacje',
  '/provider/finance': 'Panel',
  '/provider/settings': 'Ustawienia firmy',
  '/provider/profile': 'Profil firmy',
  '/provider/me': 'Mój profil',
  '/provider/staff': 'Zespół'
}

export function useBreadcrumb() {
  const route = useRoute()
  const ctx = useContextStore()

  const items = computed(() => {
    const isProvider = ctx.activeContext.type === 'org'
    const root = isProvider ? { label: 'Pulpit', to: '/provider' } : { label: 'Start', to: '/' }
    const path = route.path

    if (path === root.to) return [root]

    const label = LABELS[path] || ''
    return label ? [root, { label }] : [root]
  })

  return { items }
}
