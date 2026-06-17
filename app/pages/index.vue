<script setup>
definePageMeta({ layout: 'app', context: 'public' })
useHead({ title: 'DogLife' })

const ctx = useContextStore()
const { user } = useAuth()
const { openLogin, openSignup } = useAuthModal()
const authFetch = useAuthFetch()
const toast = useToast()
const isLoggedIn = computed(() => !!user.value)

const acceptingId = ref(null)
async function acceptInvite(invite) {
  acceptingId.value = invite.membershipId
  try {
    await authFetch(`/api/invites/${invite.membershipId}/accept`, { method: 'POST' })
    await ctx.load(true)
    toast.add({ title: `Dołączono do firmy ${invite.organizationName}.`, color: 'success' })
  } catch (e) {
    toast.add({ title: e?.statusMessage || 'Nie udało się przyjąć zaproszenia.', color: 'error' })
  } finally {
    acceptingId.value = null
  }
}

// Opiekun dashboard — placeholder. Four blocks per ui-docs/02 (full spec deferred to 03-dashboard).
const blocks = [
  { title: 'Najbliższa rezerwacja', icon: 'i-lucide-calendar-clock', empty: 'Brak nadchodzących rezerwacji.' },
  { title: 'Przypomnienia', icon: 'i-lucide-bell-ring', empty: 'Brak przypomnień (zdrowie, prace domowe).' },
  { title: 'Skróty', icon: 'i-lucide-zap', empty: 'Szybkie akcje pojawią się tutaj.' },
  { title: 'Obserwowane wydarzenia', icon: 'i-lucide-calendar-heart', empty: 'Nie obserwujesz jeszcze wydarzeń.' }
]
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- Anonymous: invite to sign in / register; only Szukaj + (część) Ustawień są użyteczne bez logowania. -->
    <template v-if="!isLoggedIn">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-highlighted">
          Witaj w DogLife
        </h1>
        <p class="text-muted">
          Zaloguj się lub załóż konto, aby rezerwować usługi, zarządzać zwierzakami i prowadzić firmę.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          label="Załóż konto"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
          @click="openSignup"
        />
        <UButton
          label="Zaloguj się"
          color="neutral"
          variant="subtle"
          @click="openLogin"
        />
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Dostępne bez logowania
          </h2>
        </template>
        <div class="grid gap-3 sm:grid-cols-2">
          <UButton
            block
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-search"
            label="Szukaj usług"
            to="/search"
          />
          <UButton
            block
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-lucide-settings"
            label="Ustawienia"
            to="/settings"
          />
        </div>
      </UCard>
    </template>

    <!-- Logged-in Opiekun dashboard -->
    <template v-else>
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          Cześć, {{ ctx.user?.displayName || user?.displayName || 'Opiekunie' }} 👋
        </h1>
        <p class="text-muted text-sm">
          Twój pulpit opiekuna.
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
              Zaproszenia do firmy
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
                zaproszenie jako pracownik
              </p>
            </div>
            <UButton
              label="Dołącz"
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
