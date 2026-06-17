import { defineStore } from 'pinia'

/**
 * The single source of truth for "which world am I in" — Opiekun (guardian) or a specific
 * organization membership (provider). Backed by /api/me; the active choice is persisted in a
 * cookie so it survives reloads + SSR. See ui-docs/02-app-shell-and-navigation.md.
 */
export type ContextType = 'opiekun' | 'org'

export interface Membership {
  membershipId: string
  organizationId: string
  organizationName: string
  organizationStatus: 'draft' | 'active' | 'suspended'
  organizationLogoUrl?: string | null
  role: 'owner' | 'staff'
  shortDescription?: string | null
  longDescription?: string | null
  languages?: string[]
  avatarUrl?: string | null
}

export interface ActiveContext {
  type: ContextType
  label: string
  membership: Membership | null
}

const OPIEKUN_KEY = 'opiekun'

export const useContextStore = defineStore('context', () => {
  const user = ref<Record<string, unknown> | null>(null)
  const memberships = ref<Membership[]>([])
  const invites = ref<Array<{ membershipId: string, organizationId: string, organizationName: string, role: string }>>([])
  const loaded = ref(false)

  // Persisted across reloads/SSR. Value is 'opiekun' or a membershipId.
  const activeKey = useCookie<string>('dl-context', { default: () => OPIEKUN_KEY, sameSite: 'lax' })
  // Remembers the last org the user worked in, so provider deep-links from the Opiekun
  // context reopen that org (not an arbitrary first membership).
  const lastOrgKey = useCookie<string | null>('dl-last-org', { default: () => null, sameSite: 'lax' })

  async function load(force = false) {
    if (loaded.value && !force) return
    const authFetch = useAuthFetch()
    try {
      const data = await authFetch<{ user: Record<string, unknown>, memberships: Membership[], invites?: typeof invites.value }>('/api/me')
      user.value = data.user
      memberships.value = data.memberships
      invites.value = data.invites ?? []

      // Drop a stale selection (membership removed) back to Opiekun.
      if (activeKey.value !== OPIEKUN_KEY && !memberships.value.some(m => m.membershipId === activeKey.value)) {
        activeKey.value = OPIEKUN_KEY
      }
      // Forget a remembered org that no longer exists.
      if (lastOrgKey.value && !memberships.value.some(m => m.membershipId === lastOrgKey.value)) {
        lastOrgKey.value = null
      }
    } finally {
      // Always flip `loaded` so the shell renders (skeleton → real UI) instead of
      // hanging on the skeleton if /api/me errors; degrades to the Opiekun context.
      loaded.value = true
    }
  }

  const activeContext = computed<ActiveContext>(() => {
    if (activeKey.value !== OPIEKUN_KEY) {
      const m = memberships.value.find(m => m.membershipId === activeKey.value)
      if (m) return { type: 'org', label: m.organizationName, membership: m }
    }
    return { type: 'opiekun', label: 'Opiekun', membership: null }
  })

  function setContext(key: string) {
    activeKey.value = key
    if (key !== OPIEKUN_KEY) lastOrgKey.value = key
  }

  /** Best org membership to open for a provider route from the Opiekun context. */
  function resolveProviderKey(): string | null {
    if (lastOrgKey.value && memberships.value.some(m => m.membershipId === lastOrgKey.value)) {
      return lastOrgKey.value
    }
    return memberships.value[0]?.membershipId ?? null
  }

  function reset() {
    user.value = null
    memberships.value = []
    invites.value = []
    loaded.value = false
    // Clear the persisted context so a re-login (or a different user on this browser)
    // doesn't inherit a stale org selection.
    activeKey.value = OPIEKUN_KEY
    lastOrgKey.value = null
  }

  return { user, memberships, invites, loaded, activeKey, lastOrgKey, activeContext, load, setContext, resolveProviderKey, reset }
})
