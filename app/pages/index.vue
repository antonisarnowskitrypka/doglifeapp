<script setup>
definePageMeta({ layout: 'app', context: 'public' })
const { t } = useI18n()
useHead({ title: t('home.meta.title') })

const ctx = useContextStore()
const { user } = useAuth()
const { openLogin, openSignup } = useAuthModal()
const authFetch = useAuthFetch()
const toast = useToast()
const { apiErrorMessage } = useApiError()
const isLoggedIn = computed(() => !!user.value)

const acceptingId = ref(null)
async function acceptInvite(invite) {
  acceptingId.value = invite.membershipId
  try {
    await authFetch(`/api/invites/${invite.membershipId}/accept`, { method: 'POST' })
    await ctx.load(true)
    toast.add({ title: t('home.invites.accepted', { name: invite.organizationName }), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'home.invites.error'), color: 'error' })
  } finally {
    acceptingId.value = null
  }
}

// Opiekun dashboard — placeholder. Four blocks per ui-docs/02 (full spec deferred to 03-dashboard).
const blocks = [
  { title: t('home.blocks.nextBooking.title'), icon: 'i-lucide-calendar-clock', empty: t('home.blocks.nextBooking.empty') },
  { title: t('home.blocks.reminders.title'), icon: 'i-lucide-bell-ring', empty: t('home.blocks.reminders.empty') },
  { title: t('home.blocks.shortcuts.title'), icon: 'i-lucide-zap', empty: t('home.blocks.shortcuts.empty') },
  { title: t('home.blocks.events.title'), icon: 'i-lucide-calendar-heart', empty: t('home.blocks.events.empty') }
]
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- Anonymous: invite to sign in / register; only Szukaj + (część) Ustawień są użyteczne bez logowania. -->
    <template v-if="!isLoggedIn">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-highlighted">
          {{ $t('home.anon.title') }}
        </h1>
        <p class="text-muted">
          {{ $t('home.anon.description') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          :label="$t('auth.actions.signup')"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
          @click="openSignup"
        />
        <UButton
          :label="$t('auth.actions.login')"
          color="neutral"
          variant="subtle"
          @click="openLogin"
        />
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('home.anon.availableTitle') }}
          </h2>
        </template>
        <div class="grid gap-3 sm:grid-cols-2">
          <UButton
            block
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-search"
            :label="$t('home.anon.searchServices')"
            to="/search"
          />
          <UButton
            block
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-settings"
            :label="$t('home.anon.settings')"
            to="/settings"
          />
        </div>
      </UCard>
    </template>

    <!-- Logged-in Opiekun dashboard -->
    <template v-else>
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          {{ $t('home.dashboard.greeting', { name: ctx.user?.displayName || user?.displayName || $t('home.dashboard.fallbackName') }) }}
        </h1>
        <p class="text-muted text-sm">
          {{ $t('home.dashboard.subtitle') }}
        </p>
      </div>

      <UCard
        v-if="ctx.invites.length"
        :ui="{ root: 'ring-primary/30' }"
      >
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-mail"
              class="size-5 text-primary"
            />
            <h2 class="font-semibold">
              {{ $t('home.invites.title') }}
            </h2>
          </div>
        </template>
        <div class="divide-y divide-default">
          <div
            v-for="inv in ctx.invites"
            :key="inv.membershipId"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <UAvatar
              :alt="inv.organizationName"
              icon="i-lucide-building-2"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">
                {{ inv.organizationName }}
              </p>
              <p class="text-xs text-muted">
                {{ $t('home.invites.role') }}
              </p>
            </div>
            <UButton
              :label="$t('home.invites.join')"
              color="primary"
              size="sm"
              :loading="acceptingId === inv.membershipId"
              @click="acceptInvite(inv)"
            />
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard
          v-for="b in blocks"
          :key="b.title"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="b.icon"
                class="size-5 text-primary"
              />
              <h2 class="font-semibold">
                {{ b.title }}
              </h2>
            </div>
          </template>
          <p class="text-sm text-muted">
            {{ b.empty }}
          </p>
        </UCard>
      </div>
    </template>
  </UContainer>
</template>
