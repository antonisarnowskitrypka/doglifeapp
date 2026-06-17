<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
useHead({ title: 'Załóż firmę — DogLife' })

const ctx = useContextStore()
const authFetch = useAuthFetch()

const categoryItems = SERVICE_CATEGORIES.map(c => ({ label: c.label, value: c.key, icon: c.icon }))
const speciesItems = SPECIES.map(s => ({ label: s.label, value: s.key }))

const state = reactive({
  name: '',
  categoryKeys: [],
  acceptedSpecies: ['dog', 'cat']
})
const loading = ref(false)
const formError = ref('')

function validate(s) {
  const errors = []
  if (!s.name || s.name.trim().length < 2) errors.push({ name: 'name', message: 'Podaj nazwę (min. 2 znaki)' })
  if (!s.categoryKeys.length) errors.push({ name: 'categoryKeys', message: 'Wybierz min. jedną kategorię' })
  if (!s.acceptedSpecies.length) errors.push({ name: 'acceptedSpecies', message: 'Zaznacz min. jeden gatunek' })
  return errors
}

async function onSubmit() {
  loading.value = true
  formError.value = ''
  try {
    const res = await authFetch('/api/orgs', { method: 'POST', body: { ...state } })
    await ctx.load(true) // refresh memberships so the new org appears
    ctx.setContext(res.membershipId) // switch into the freshly created org
    await navigateTo('/provider')
  } catch (e) {
    formError.value = e?.statusMessage || e?.data?.statusMessage || 'Nie udało się założyć firmy.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-xl space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-highlighted">
        Załóż firmę
      </h1>
      <p class="text-muted text-sm">
        Utworzymy firmę jako wersję roboczą. Resztę (lokalizacje, usługi, grafik, płatności)
        uzupełnisz później przed publikacją.
      </p>
    </div>

    <UForm
      :state="state"
      :validate="validate"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField
        label="Nazwa firmy"
        name="name"
        required
      >
        <UInput
          v-model="state.name"
          placeholder="np. Akademia Psa Burek"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Kategorie usług"
        name="categoryKeys"
        required
        hint="możesz wybrać kilka"
      >
        <USelectMenu
          v-model="state.categoryKeys"
          :items="categoryItems"
          value-key="value"
          multiple
          placeholder="Wybierz kategorie"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Obsługiwane gatunki"
        name="acceptedSpecies"
        required
      >
        <UCheckboxGroup
          v-model="state.acceptedSpecies"
          :items="speciesItems"
          value-key="value"
          orientation="horizontal"
        />
      </UFormField>

      <UAlert
        v-if="formError"
        color="error"
        variant="subtle"
        :title="formError"
        icon="i-lucide-circle-alert"
      />

      <div class="flex items-center gap-2">
        <UButton
          type="submit"
          label="Załóż firmę"
          color="primary"
          :loading="loading"
        />
        <UButton
          label="Anuluj"
          color="neutral"
          variant="ghost"
          to="/"
        />
      </div>
    </UForm>
  </UContainer>
</template>
