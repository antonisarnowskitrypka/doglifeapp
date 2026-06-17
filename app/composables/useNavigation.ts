export interface NavItem {
  label: string
  icon: string
  to: string
}

/**
 * Two navigation shapes per context (ui-docs/02):
 * - mobile: a compact 5-item bottom bar ending in "Więcej" (→ the settings hub).
 * - desktop: an expanded, grouped side rail that surfaces everything (plenty of room).
 * Only routes that have a page are linked (avoid 404s) — extend as views land.
 */
const OPIEKUN_MOBILE: NavItem[] = [
  { label: 'Start', icon: 'i-lucide-house', to: '/' },
  { label: 'Szukaj', icon: 'i-lucide-search', to: '/search' },
  { label: 'Rezerwacje', icon: 'i-lucide-calendar-check', to: '/bookings' },
  { label: 'Zwierzaki', icon: 'i-lucide-paw-print', to: '/pets' },
  { label: 'Więcej', icon: 'i-lucide-menu', to: '/settings' }
]

const PROVIDER_MOBILE: NavItem[] = [
  { label: 'Pulpit', icon: 'i-lucide-layout-dashboard', to: '/provider' },
  { label: 'Kalendarz', icon: 'i-lucide-calendar-days', to: '/provider/calendar' },
  { label: 'Rezerwacje', icon: 'i-lucide-inbox', to: '/provider/bookings' },
  { label: 'Panel', icon: 'i-lucide-chart-line', to: '/provider/finance' },
  { label: 'Więcej', icon: 'i-lucide-menu', to: '/provider/settings' }
]

const OPIEKUN_DESKTOP: NavItem[][] = [
  [
    { label: 'Start', icon: 'i-lucide-house', to: '/' },
    { label: 'Szukaj', icon: 'i-lucide-search', to: '/search' },
    { label: 'Rezerwacje', icon: 'i-lucide-calendar-check', to: '/bookings' },
    { label: 'Zwierzaki', icon: 'i-lucide-paw-print', to: '/pets' }
  ],
  [
    { label: 'Powiadomienia', icon: 'i-lucide-bell', to: '/notifications' },
    { label: 'Ustawienia', icon: 'i-lucide-settings', to: '/settings' }
  ]
]

const PROVIDER_DESKTOP: NavItem[][] = [
  [
    { label: 'Pulpit', icon: 'i-lucide-layout-dashboard', to: '/provider' },
    { label: 'Kalendarz', icon: 'i-lucide-calendar-days', to: '/provider/calendar' },
    { label: 'Rezerwacje', icon: 'i-lucide-inbox', to: '/provider/bookings' },
    { label: 'Panel', icon: 'i-lucide-chart-line', to: '/provider/finance' }
  ],
  [
    { label: 'Profil firmy', icon: 'i-lucide-store', to: '/provider/profile' },
    { label: 'Mój profil', icon: 'i-lucide-id-card', to: '/provider/me' },
    { label: 'Zespół', icon: 'i-lucide-users', to: '/provider/staff' },
    { label: 'Ustawienia', icon: 'i-lucide-settings', to: '/provider/settings' }
  ]
]

export function useNavigation() {
  const ctx = useContextStore()
  const isProvider = computed(() => ctx.activeContext.type === 'org')

  const mobileItems = computed<NavItem[]>(() => (isProvider.value ? PROVIDER_MOBILE : OPIEKUN_MOBILE))
  const desktopGroups = computed<NavItem[][]>(() => (isProvider.value ? PROVIDER_DESKTOP : OPIEKUN_DESKTOP))

  return { mobileItems, desktopGroups }
}
