<script setup>
definePageMeta({ layout: 'app', context: 'public' })
useHead({ title: 'Ustawienia — DogLife' })

const ctx = useContextStore()
const { user } = useAuth()
const { openLogin } = useAuthModal()
const authFetch = useAuthFetch()
const toast = useToast()
const isLoggedIn = computed(() => !!user.value)

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
    </template>
  </UContainer>
</template>
