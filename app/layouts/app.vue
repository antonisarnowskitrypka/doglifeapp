<script setup>
const ctx = useContextStore()
const { mobileItems, desktopGroups } = useNavigation()
const { items: breadcrumb } = useBreadcrumb()
const { user, signOut } = useAuth()
const { openLogin, openSignup } = useAuthModal()
const isLoggedIn = computed(() => !!user.value)
const route = useRoute()
const router = useRouter()

// Auth state is client-side for now, so load the context (profile + memberships) on the client.
// authFetch resolves the user/token internally; load() always flips `loaded` (even on error).
onMounted(() => {
  ctx.load()
})

// Login-required scopes: when anonymous, show a sign-up teaser instead of the page content.
const requiresAuth = computed(() => ['opiekun', 'provider', 'shared'].includes(route.meta.context))
const showTeaser = computed(() => requiresAuth.value && !isLoggedIn.value)
// Skeleton only while a logged-in user's context is still loading.
const showNavSkeleton = computed(() => isLoggedIn.value && !ctx.loaded)

function isActive(to) {
  if (route.path === to) return true
  // Dashboards ('/' and '/provider') match exactly, not as a prefix of their sub-routes.
  if (to === '/' || to === '/provider') return false
  return route.path.startsWith(to + '/') || route.path.startsWith(to)
}

// "Main screens" = the 4 primary bottom-nav destinations (excluding "Więcej"), per context.
// No back arrow there; the mobile top bar shows the account block instead.
const mainPaths = computed(() => mobileItems.value.slice(0, -1).map(i => i.to))
const isMainScreen = computed(() => mainPaths.value.includes(route.path))
const currentLabel = computed(() => breadcrumb.value[breadcrumb.value.length - 1]?.label || '')

const isProvider = computed(() => ctx.activeContext.type === 'org')
// Context avatar: org-scoped staff photo in a provider context, else the personal avatar.
const contextAvatar = computed(() =>
  (isProvider.value ? ctx.activeContext.membership?.avatarUrl : null) || ctx.user?.avatarUrl || undefined
)
const displayName = computed(() => ctx.user?.displayName || user.value?.displayName || 'Konto')
const companyName = computed(() => (isProvider.value ? ctx.activeContext.membership?.organizationName : ''))
const roleChip = computed(() => {
  if (!isProvider.value) return 'OPIEKUN'
  return ctx.activeContext.membership?.role === 'owner' ? 'WŁAŚCICIEL' : 'PRACOWNIK'
})

// Map active state per item; recurse into submenu children (parents have no `to`).
function withActive(items) {
  return items.map((item) => {
    if (item.children) return { ...item, children: withActive(item.children) }
    return { ...item, active: isActive(item.to) }
  })
}
const desktopItems = computed(() => desktopGroups.value.map(group => withActive(group)))

const userMenuItems = computed(() => [
  [{ label: displayName.value, type: 'label' }],
  [{ label: 'Ustawienia konta', icon: 'i-lucide-settings', to: '/settings' }],
  [{ label: 'Wyloguj', icon: 'i-lucide-log-out', color: 'error', onSelect: onSignOut }]
])

function goBack() {
  router.back()
}

async function onSignOut() {
  await signOut()
  ctx.reset()
  await navigateTo('/')
}
</script>

<template>
  <div class="h-svh flex flex-col lg:flex-row bg-default overflow-hidden">
    <!-- Desktop side rail -->
    <aside class="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-default p-4 gap-4 overflow-y-auto">
      <NuxtLink
        to="/"
        class="font-bold text-xl text-highlighted px-1"
      >
        DogLife
      </NuxtLink>

      <!-- Back + breadcrumb (between logo and context) -->
      <div class="flex items-center gap-1.5 min-w-0">
        <UButton
          v-if="!isMainScreen"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Wstecz"
          @click="goBack"
        />
        <UBreadcrumb
          :items="breadcrumb"
          :ui="{ root: 'min-w-0', list: 'flex-nowrap', label: 'truncate' }"
        />
      </div>

      <AppContextSwitcher />

      <div
        v-if="showNavSkeleton"
        class="flex-1 flex flex-col gap-2 pt-1"
      >
        <USkeleton
          v-for="n in 6"
          :key="n"
          class="h-8 w-full rounded-md"
        />
      </div>
      <UNavigationMenu
        v-else
        orientation="vertical"
        :items="desktopItems"
        class="flex-1 min-h-0 overflow-y-auto"
      />

      <div
        v-if="!isLoggedIn"
        class="grid gap-2"
      >
        <UButton
          label="Załóż konto"
          color="primary"
          block
          @click="openSignup"
        />
        <UButton
          label="Zaloguj się"
          color="neutral"
          variant="subtle"
          block
          @click="openLogin"
        />
      </div>
      <UDropdownMenu
        v-else
        :items="userMenuItems"
        :content="{ align: 'start', side: 'top' }"
        :ui="{ content: 'min-w-56' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          block
          class="justify-start"
        >
          <UAvatar
            :src="ctx.user?.avatarUrl || undefined"
            :alt="ctx.user?.displayName"
            size="xs"
          />
          <span class="truncate">{{ ctx.user?.displayName || user?.displayName || 'Konto' }}</span>
        </UButton>
      </UDropdownMenu>
    </aside>

    <!-- Main column -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Mobile top bar (context switcher lives under "Więcej", not here) -->
      <header class="lg:hidden flex items-center justify-between gap-2 p-3 border-b border-default shrink-0">
        <!-- Main screens: account block (avatar + name + role chip + company), tap → account menu -->
        <template v-if="isMainScreen">
          <UDropdownMenu
            v-if="isLoggedIn"
            :items="userMenuItems"
            :content="{ align: 'start' }"
            :ui="{ content: 'min-w-56' }"
          >
            <button class="flex items-center gap-2 min-w-0 text-left">
              <UAvatar
                :src="contextAvatar"
                :alt="displayName"
                size="sm"
              />
              <span class="flex flex-col min-w-0 leading-tight">
                <span class="flex items-center gap-1.5 min-w-0">
                  <span class="font-semibold truncate">{{ displayName }}</span>
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
            </button>
          </UDropdownMenu>
          <NuxtLink
            v-else
            to="/"
            class="font-bold text-lg text-highlighted"
          >
            DogLife
          </NuxtLink>
        </template>

        <!-- Sub screens: back + current page title -->
        <div
          v-else
          class="flex items-center gap-1 min-w-0"
        >
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            aria-label="Wstecz"
            @click="goBack"
          />
          <span class="font-semibold truncate">{{ currentLabel }}</span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <UButton
            to="/notifications"
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            aria-label="Powiadomienia"
          />
          <UColorModeButton />
        </div>
      </header>

      <!-- Only this slot scrolls -->
      <main class="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <AppEmailVerifyBanner v-if="isLoggedIn" />
        <AuthTeaser v-if="showTeaser" />
        <div v-show="!showTeaser">
          <slot />
        </div>
      </main>

      <!-- Mobile bottom tab bar -->
      <nav class="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t border-default bg-default/95 backdrop-blur grid grid-cols-5">
        <template v-if="showNavSkeleton">
          <div
            v-for="n in 5"
            :key="n"
            class="flex flex-col items-center justify-center gap-1 py-2"
          >
            <USkeleton class="size-5 rounded" />
            <USkeleton class="h-2 w-10 rounded" />
          </div>
        </template>
        <NuxtLink
          v-for="item in (showNavSkeleton ? [] : mobileItems)"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors"
          :class="isActive(item.to) ? 'text-primary' : 'text-muted'"
        >
          <UIcon
            :name="item.icon"
            class="size-5"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>

    <AppAuthModal />
  </div>
</template>
