<script setup>
definePageMeta({ layout: 'app', context: 'public' })
useHead({ title: 'Ustawienia — DogLife' })

const ctx = useContextStore()
const { user, changePassword, requestAccountDeletion } = useAuth()
const { openLogin } = useAuthModal()
const authFetch = useAuthFetch()
const toast = useToast()
const isLoggedIn = computed(() => !!user.value)

// Only email/password accounts can change a password; social-only accounts get a note instead.
const hasPassword = computed(() => !!user.value?.providerData?.some(p => p.providerId === 'password'))
const PROVIDER_LABELS = { 'google.com': 'Google', 'apple.com': 'Apple' }
const socialProviders = computed(() =>
  (user.value?.providerData || [])
    .map(p => PROVIDER_LABELS[p.providerId])
    .filter(Boolean)
    .join(' / ') || 'zewnętrznego dostawcę'
)

const pw = reactive({ current: '', next: '', confirm: '' })
const pwSaving = ref(false)
function validatePw() {
  const e = []
  if (!pw.current) e.push({ name: 'current', message: 'Podaj obecne hasło' })
  if (!pw.next || pw.next.length < 6) e.push({ name: 'next', message: 'Hasło min. 6 znaków' })
  if (pw.confirm !== pw.next) e.push({ name: 'confirm', message: 'Hasła nie są takie same' })
  return e
}
async function onChangePassword() {
  pwSaving.value = true
  try {
    await changePassword(pw.current, pw.next)
    pw.current = pw.next = pw.confirm = ''
    toast.add({ title: 'Hasło zostało zmienione.', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: authErrorMessage(e), color: 'error' })
  } finally {
    pwSaving.value = false
  }
}

// Soft account deletion: 7-day grace, reversible by signing back in (see useAuth).
const deleteOpen = ref(false)
const deleting = ref(false)
async function onDeleteAccount() {
  deleting.value = true
  try {
    await requestAccountDeletion()
    ctx.reset()
    deleteOpen.value = false
    toast.add({
      title: 'Zaplanowano usunięcie konta.',
      description: 'Konto zostanie usunięte za 7 dni. Zaloguj się ponownie w tym czasie, aby anulować.',
      color: 'info',
      icon: 'i-lucide-clock'
    })
    await navigateTo('/')
  } catch (e) {
    toast.add({ title: e?.statusMessage || authErrorMessage(e), color: 'error' })
  } finally {
    deleting.value = false
  }
}

const localeItems = [
  { label: 'Polski', value: 'pl' },
  { label: 'English', value: 'en' },
  { label: 'Български', value: 'bg' }
]

const form = reactive({ displayName: '', bio: '', phone: '', locale: 'pl', company: { name: '', taxId: '', address: '' } })
const saving = ref(false)

function hydrate() {
  const u = ctx.user || {}
  form.displayName = u.displayName || ''
  form.bio = u.bio || ''
  form.phone = u.phone || ''
  form.locale = u.locale || 'pl'
  form.company.name = u.companyDetails?.name || ''
  form.company.taxId = u.companyDetails?.taxId || ''
  form.company.address = u.companyDetails?.address || ''
}

onMounted(async () => {
  await ctx.load()
  hydrate()
})
watch(() => ctx.user, hydrate)

async function save() {
  saving.value = true
  try {
    const hasCompany = form.company.name || form.company.taxId || form.company.address
    await authFetch('/api/me', {
      method: 'PATCH',
      body: {
        displayName: form.displayName,
        bio: form.bio,
        phone: form.phone,
        locale: form.locale,
        companyDetails: hasCompany ? { ...form.company } : null
      }
    })
    await ctx.load(true)
    toast.add({ title: 'Zapisano zmiany.', color: 'success' })
  } catch (e) {
    toast.add({ title: e?.statusMessage || 'Nie udało się zapisać.', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <!-- Context switcher at the very top on mobile (the "Więcej" hub); desktop has it in the rail. -->
    <AppContextSwitcher
      v-if="isLoggedIn"
      block
      class="lg:hidden"
    />

    <h1 class="text-2xl font-bold text-highlighted">
      Ustawienia
    </h1>

    <UAlert
      v-if="!isLoggedIn"
      color="info"
      variant="subtle"
      icon="i-lucide-lock"
      title="Zaloguj się, aby zarządzać kontem"
      :actions="[{ label: 'Zaloguj się', color: 'primary', onClick: openLogin }]"
    />

    <template v-else>
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Profil
          </h2>
        </template>

        <div class="space-y-5">
          <AvatarUploader
            :src="ctx.user?.avatarUrl"
            endpoint="/api/me/avatar"
            :alt="form.displayName"
            @uploaded="ctx.load(true)"
          />

          <UFormField label="Imię / nazwa wyświetlana">
            <UInput
              v-model="form.displayName"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="O mnie"
            hint="opcjonalne"
          >
            <UTextarea
              v-model="form.bio"
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              label="Telefon"
              hint="opcjonalne"
            >
              <UInput
                v-model="form.phone"
                type="tel"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Język">
              <USelectMenu
                v-model="form.locale"
                :items="localeItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Dane do faktury
          </h2>
          <p class="text-xs text-muted">
            Opcjonalne — używane przy fakturze na firmę.
          </p>
        </template>
        <div class="space-y-4">
          <UFormField label="Nazwa firmy">
            <UInput
              v-model="form.company.name"
              class="w-full"
            />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="NIP">
              <UInput
                v-model="form.company.taxId"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Adres">
              <UInput
                v-model="form.company.address"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <div class="flex justify-end">
        <UButton
          label="Zapisz"
          color="primary"
          icon="i-lucide-check"
          :loading="saving"
          @click="save"
        />
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Zmiana hasła
          </h2>
        </template>

        <UForm
          v-if="hasPassword"
          :state="pw"
          :validate="validatePw"
          class="space-y-4"
          @submit="onChangePassword"
        >
          <UFormField
            label="Obecne hasło"
            name="current"
          >
            <UInput
              v-model="pw.current"
              type="password"
              autocomplete="current-password"
              class="w-full"
            />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              label="Nowe hasło"
              name="next"
              hint="min. 6 znaków"
            >
              <UInput
                v-model="pw.next"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Powtórz nowe hasło"
              name="confirm"
            >
              <UInput
                v-model="pw.confirm"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="flex justify-end">
            <UButton
              type="submit"
              label="Zmień hasło"
              color="primary"
              icon="i-lucide-key-round"
              :loading="pwSaving"
            />
          </div>
        </UForm>

        <p
          v-else
          class="text-sm text-muted"
        >
          Logujesz się przez {{ socialProviders }} — to konto nie ma hasła do zmiany.
        </p>
      </UCard>

      <UCard :ui="{ root: 'ring-error/30' }">
        <template #header>
          <h2 class="font-semibold text-error">
            Usuń konto
          </h2>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            Konto zostanie zablokowane i trwale usunięte po <strong>7 dniach</strong>. W tym czasie
            możesz cofnąć decyzję — wystarczy zalogować się ponownie. Po terminie dane usuwa administrator,
            tak aby zachować spójność historii (np. rezerwacji).
          </p>
          <div class="flex justify-end">
            <UButton
              label="Usuń konto"
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              @click="deleteOpen = true"
            />
          </div>
        </div>
      </UCard>

      <UModal
        v-model:open="deleteOpen"
        title="Usunąć konto?"
      >
        <template #body>
          <div class="space-y-3 text-sm">
            <p>
              Zaplanujemy usunięcie Twojego konta za <strong>7 dni</strong> i wylogujemy Cię teraz.
            </p>
            <p class="text-muted">
              Zmieniłeś zdanie? Zaloguj się ponownie przed upływem terminu, a proces zostanie anulowany.
            </p>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2 w-full">
            <UButton
              label="Anuluj"
              color="neutral"
              variant="ghost"
              @click="deleteOpen = false"
            />
            <UButton
              label="Tak, usuń konto"
              color="error"
              icon="i-lucide-trash-2"
              :loading="deleting"
              @click="onDeleteAccount"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UContainer>
</template>
