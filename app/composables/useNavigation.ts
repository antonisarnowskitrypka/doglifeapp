/** Declarative nav item: `labelKey` is an i18n key resolved at render time (see localize). */
interface NavItemDef {
  labelKey: string
  icon: string
  to?: string
  children?: NavItemDef[]
  defaultOpen?: boolean
}

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
const APP_SETTINGS: NavItemDef = {
  labelKey: 'nav.appSettings.title',
  icon: 'i-lucide-settings-2',
  defaultOpen: true,
  children: [
    { labelKey: 'nav.appSettings.notifications', icon: 'i-lucide-bell-ring', to: '/app-settings/notifications' },
    { labelKey: 'nav.appSettings.language', icon: 'i-lucide-languages', to: '/app-settings/language' },
    { labelKey: 'nav.appSettings.appearance', icon: 'i-lucide-sun-moon', to: '/app-settings/appearance' }
  ]
}

const OPIEKUN_MOBILE: NavItemDef[] = [
  { labelKey: 'nav.opiekun.home', icon: 'i-lucide-house', to: '/' },
  { labelKey: 'nav.opiekun.search', icon: 'i-lucide-search', to: '/search' },
  { labelKey: 'nav.opiekun.bookings', icon: 'i-lucide-calendar-check', to: '/bookings' },
  { labelKey: 'nav.opiekun.pets', icon: 'i-lucide-paw-print', to: '/pets' },
  { labelKey: 'nav.more', icon: 'i-lucide-menu', to: '/settings' }
]

const PROVIDER_MOBILE: NavItemDef[] = [
  { labelKey: 'nav.provider.dashboard', icon: 'i-lucide-layout-dashboard', to: '/provider' },
  { labelKey: 'nav.provider.calendar', icon: 'i-lucide-calendar-days', to: '/provider/calendar' },
  { labelKey: 'nav.provider.bookings', icon: 'i-lucide-inbox', to: '/provider/bookings' },
  { labelKey: 'nav.provider.finance', icon: 'i-lucide-chart-line', to: '/provider/finance' },
  { labelKey: 'nav.more', icon: 'i-lucide-menu', to: '/provider/settings' }
]

const OPIEKUN_DESKTOP: NavItemDef[][] = [
  [
    { labelKey: 'nav.opiekun.home', icon: 'i-lucide-house', to: '/' },
    { labelKey: 'nav.opiekun.search', icon: 'i-lucide-search', to: '/search' },
    { labelKey: 'nav.opiekun.bookings', icon: 'i-lucide-calendar-check', to: '/bookings' },
    { labelKey: 'nav.opiekun.pets', icon: 'i-lucide-paw-print', to: '/pets' }
  ],
  [
    { labelKey: 'nav.notifications', icon: 'i-lucide-bell', to: '/notifications' },
    APP_SETTINGS
  ]
]

const PROVIDER_DESKTOP: NavItemDef[][] = [
  [
    { labelKey: 'nav.provider.dashboard', icon: 'i-lucide-layout-dashboard', to: '/provider' },
    { labelKey: 'nav.provider.calendar', icon: 'i-lucide-calendar-days', to: '/provider/calendar' },
    { labelKey: 'nav.provider.bookings', icon: 'i-lucide-inbox', to: '/provider/bookings' },
    { labelKey: 'nav.provider.finance', icon: 'i-lucide-chart-line', to: '/provider/finance' }
  ],
  [
    // Personal presence within the company — kept out of "Ustawienia firmy" on purpose.
    {
      labelKey: 'nav.myCard.title',
      icon: 'i-lucide-contact',
      defaultOpen: true,
      children: [
        { labelKey: 'nav.myCard.profile', icon: 'i-lucide-id-card', to: '/provider/me' },
        { labelKey: 'nav.myCard.reviews', icon: 'i-lucide-star', to: '/provider/reviews' }
      ]
    },
    {
      labelKey: 'nav.companySettings.title',
      icon: 'i-lucide-building-2',
      defaultOpen: true,
      children: [
        { labelKey: 'nav.companySettings.profile', icon: 'i-lucide-store', to: '/provider/profile' },
        { labelKey: 'nav.companySettings.staff', icon: 'i-lucide-users', to: '/provider/staff' },
        { labelKey: 'nav.companySettings.locations', icon: 'i-lucide-map-pin', to: '/provider/locations' },
        { labelKey: 'nav.companySettings.services', icon: 'i-lucide-list', to: '/provider/services' }
      ]
    },
    APP_SETTINGS
  ]
]

/** Resolve `labelKey` → translated `label`, recursing into submenu children. */
function localize(items: NavItemDef[], t: (key: string) => string): NavItem[] {
  return items.map(item => ({
    label: t(item.labelKey),
    icon: item.icon,
    to: item.to,
    defaultOpen: item.defaultOpen,
    children: item.children ? localize(item.children, t) : undefined
  }))
}

export function useNavigation() {
  const { t } = useI18n()
  const ctx = useContextStore()
  const isProvider = computed(() => ctx.activeContext.type === 'org')

  const mobileItems = computed<NavItem[]>(() => localize(isProvider.value ? PROVIDER_MOBILE : OPIEKUN_MOBILE, t))
  const desktopGroups = computed<NavItem[][]>(() =>
    (isProvider.value ? PROVIDER_DESKTOP : OPIEKUN_DESKTOP).map(group => localize(group, t))
  )

  return { mobileItems, desktopGroups }
}
