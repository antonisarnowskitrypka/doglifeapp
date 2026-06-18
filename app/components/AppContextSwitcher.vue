<script setup>
const props = defineProps({
  // Full-width rich trigger (used at the top of the mobile "Więcej" hub).
  block: { type: Boolean, default: false }
})

const ctx = useContextStore()
const { user } = useAuth()
const { openLogin } = useAuthModal()
const { t } = useI18n()
const isLoggedIn = computed(() => !!user.value)
const isProvider = computed(() => ctx.activeContext.type === 'org')

function switchTo(key, home) {
  ctx.setContext(key)
  navigateTo(home)
}

// Options: Opiekun (personal avatar / paw), one per org (company LOGO), then "Załóż firmę".
const items = computed(() => {
  const active = ctx.activeKey

  const opiekun = {
    label: t('common.context.opiekun'),
    avatar: ctx.user?.avatarUrl ? { src: ctx.user.avatarUrl } : undefined,
    icon: ctx.user?.avatarUrl ? undefined : 'i-lucide-paw-print',
    trailingIcon: active === 'opiekun' ? 'i-lucide-check' : undefined,
    onSelect: () => switchTo('opiekun', '/')
  }

  const orgs = ctx.memberships.map(m => ({
    label: m.organizationName,
    avatar: m.organizationLogoUrl ? { src: m.organizationLogoUrl } : undefined,
    icon: m.organizationLogoUrl ? undefined : 'i-lucide-building-2',
    trailingIcon: active === m.membershipId ? 'i-lucide-check' : undefined,
    onSelect: () => switchTo(m.membershipId, '/provider')
  }))

  const become = { label: t('nav.createCompany'), icon: 'i-lucide-plus', to: '/onboarding' }

  return [[opiekun], orgs.length ? orgs : [], [become]].filter(g => g.length)
})

// Rich trigger ("value" display) — mirrors the mobile header account block.
const contextAvatar = computed(() =>
  (isProvider.value ? ctx.activeContext.membership?.avatarUrl : null) || ctx.user?.avatarUrl || undefined
)
const displayName = computed(() => ctx.user?.displayName || user.value?.displayName || t('common.labels.account'))
// Compact rail (not block): show only the first name to fit the narrow side rail.
const triggerName = computed(() => (props.block ? displayName.value : displayName.value.split(' ')[0]))
const companyName = computed(() => (isProvider.value ? ctx.activeContext.membership?.organizationName : ''))
const roleChip = computed(() => {
  if (!isProvider.value) return t('common.roles.opiekun')
  return ctx.activeContext.membership?.role === 'owner' ? t('common.roles.owner') : t('common.roles.staff')
})
</script>

<template>
  <UButton
    v-if="!isLoggedIn"
    :label="$t('auth.actions.login')"
    color="primary"
    icon="i-lucide-log-in"
    :block="block"
    @click="openLogin"
  />
  <USkeleton
    v-else-if="!ctx.loaded"
    class="h-12 rounded-md"
    :class="block ? 'w-full' : 'w-48'"
  />
  <UDropdownMenu
    v-else
    :items="items"
    :content="{ align: 'start' }"
    :ui="{ content: 'min-w-60' }"
  >
    <UButton
      color="neutral"
      variant="subtle"
      :block="block"
      trailing-icon="i-lucide-chevrons-up-down"
      class="justify-start"
    >
      <UAvatar
        :src="contextAvatar"
        :alt="displayName"
        size="sm"
      />
      <span class="flex flex-col items-start min-w-0 leading-tight flex-1">
        <span class="flex items-center gap-1.5 min-w-0">
          <span
            class="font-semibold truncate"
            :class="block ? '' : 'text-sm'"
          >{{ triggerName }}</span>
          <UBadge
            :label="roleChip"
            :color="isProvider ? 'primary' : 'info'"
            variant="subtle"
            size="xs"
            class="shrink-0"
          />
        </span>
        <span
          v-if="companyName"
          class="text-xs text-muted truncate"
        >{{ companyName }}</span>
      </span>
    </UButton>
  </UDropdownMenu>
</template>
