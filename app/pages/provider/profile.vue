<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
useHead({ title: 'Profil firmy — DogLife' })

const ctx = useContextStore()
const authFetch = useAuthFetch()
const toast = useToast()

const orgId = computed(() => ctx.activeContext.membership?.organizationId)
const isOwner = computed(() => ctx.activeContext.membership?.role === 'owner')

const categoryItems = SERVICE_CATEGORIES.map(c => ({ label: c.label, value: c.key, icon: c.icon }))
const speciesItems = SPECIES.map(s => ({ label: s.label, value: s.key }))

const org = ref(null)
const form = reactive({ name: '', description: '', categoryKeys: [], acceptedSpecies: [], company: { name: '', taxId: '', address: '' } })
const loading = ref(false)
const saving = ref(false)

async function loadOrg() {
  if (!orgId.value || !isOwner.value) return
  loading.value = true
  try {
    const o = await authFetch(`/api/orgs/${orgId.value}`)
    org.value = o
    form.name = o.name || ''
    form.description = o.description || ''
    form.categoryKeys = o.categoryKeys || []
    form.acceptedSpecies = o.acceptedSpecies || []
    form.company.name = o.companyDetails?.name || ''
    form.company.taxId = o.companyDetails?.taxId || ''
    form.company.address = o.companyDetails?.address || ''
  } catch (e) {
    toast.add({ title: e?.statusMessage || 'Nie udało się wczytać firmy.', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ctx.load()
  loadOrg()
})
watch(orgId, loadOrg)

async function save() {
  saving.value = true
  try {
    const hasCompany = form.company.name || form.company.taxId || form.company.address
    await authFetch(`/api/orgs/${orgId.value}`, {
      method: 'PATCH',
      body: {
        name: form.name,
        description: form.description,
        categoryKeys: form.categoryKeys,
        acceptedSpecies: form.acceptedSpecies,
        companyDetails: hasCompany ? { ...form.company } : null
      }
    })
    await ctx.load(true)
    toast.add({ title: 'Zapisano profil firmy.', color: 'success' })
  } catch (e) {
    toast.add({ title: e?.statusMessage || 'Nie udało się zapisać.', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <h1 class="text-2xl font-bold text-highlighted">
      Profil firmy
    </h1>

    <UAlert
      v-if="!isOwner"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      title="Tylko właściciel edytuje profil firmy"
      description="Swój profil pracownika ustawisz w sekcji „Mój profil w firmie”."
    />

    <template v-else>
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Dane firmy
          </h2>
        </template>
        <div class="space-y-5">
          <AvatarUploader
            :src="org?.logoUrl"
            :endpoint="`/api/orgs/${orgId}/logo`"
            :alt="form.name"
            icon="i-lucide-building-2"
            @uploaded="ctx.load(true)"
          />

          <UFormField label="Nazwa firmy">
            <UInput
              v-model="form.name"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Opis"
            hint="widoczny na profilu publicznym"
          >
            <UTextarea
              v-model="form.description"
              :rows="4"
              autoresize
              class="w-full"
            />
          </UFormField>

          <UFormField label="Kategorie usług">
            <USelectMenu
              v-model="form.categoryKeys"
              :items="categoryItems"
              value-key="value"
              multiple
              class="w-full"
            />
          </UFormField>

          <UFormField label="Obsługiwane gatunki">
            <UCheckboxGroup
              v-model="form.acceptedSpecies"
              :items="speciesItems"
              value-key="value"
              orientation="horizontal"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Dane do faktury
          </h2>
        </template>
        <div class="space-y-4">
          <UFormField label="Nazwa (na fakturze)">
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
