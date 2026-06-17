export interface NavItem {
  label: string
  icon: string
  /** Leaf items link somewhere; parent items (with `children`) omit `to` and act as accordions. */
  to?: string
  children?: NavItem[]
  /** Vertical side-rail submenus expand by default so the rail surfaces everything (ui-docs/02). */
  defaultOpen?: boolean
}

/**
 * Two navigation shapes per context (ui-docs/02):
 * - mobile: a compact 5-item bottom bar ending in "Więcej" (→ the settings hub).
 * - desktop: an expanded, grouped side rail. Settings live in collapsible submenus
 *   (Nuxt UI UNavigationMenu `children`), not flat links.
 * Only routes that have a page are linked (avoid 404s) — placeholder pages exist for
 * the "wkrótce" items so the submenus are complete without dead ends.
 *
 * Account settings ("Ustawienia konta") are intentionally NOT in the rail — they live only
 * under the avatar menu (see layouts/app.vue). The rail's settings are app + company scoped.
 */

// App-level preferences — same for every context (per-user, not per-org). Shown in both rails.
const APP_SETTINGS: NavItem = {
  label: 'Ustawienia aplikacji',
  icon: 'i-lucide-settings-2',
  defaultOpen: true,
  children: [
    { label: 'Powiadomienia', icon: 'i-lucide-bell-ring', to: '/app-settings/notifications' },
    { label: 'Język aplikacji', icon: 'i-lucide-languages', to: '/app-settings/language' },
    { label: 'Wygląd', icon: 'i-lucide-sun-moon', to: '/app-settings/appearance' }
  ]
}

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
    APP_SETTINGS
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
    // Personal presence within the company — kept out of "Ustawienia firmy" on purpose.
    {
      label: 'Moja wizytówka',
      icon: 'i-lucide-contact',
      defaultOpen: true,
      children: [
        { label: 'Mój profil firmowy', icon: 'i-lucide-id-card', to: '/provider/me' },
        { label: 'Moje opinie', icon: 'i-lucide-star', to: '/provider/reviews' }
      ]
    },
    {
      label: 'Ustawienia firmy',
      icon: 'i-lucide-building-2',
      defaultOpen: true,
      children: [
        { label: 'Profil firmy', icon: 'i-lucide-store', to: '/provider/profile' },
        { label: 'Zespół', icon: 'i-lucide-users', to: '/provider/staff' },
        { label: 'Usługi', icon: 'i-lucide-list', to: '/provider/services' },
        { label: 'Lokalizacje i godziny', icon: 'i-lucide-map-pin', to: '/provider/locations' }
      ]
    },
    APP_SETTINGS
  ]
]

export function useNavigation() {
  const ctx = useContextStore()
  const isProvider = computed(() => ctx.activeContext.type === 'org')

  const mobileItems = computed<NavItem[]>(() => (isProvider.value ? PROVIDER_MOBILE : OPIEKUN_MOBILE))
  const desktopGroups = computed<NavItem[][]>(() => (isProvider.value ? PROVIDER_DESKTOP : OPIEKUN_DESKTOP))

  return { mobileItems, desktopGroups }
}
