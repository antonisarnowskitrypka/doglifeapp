<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
const { t } = useI18n()
useHead({ title: t('onboarding.meta.title') })

const ctx = useContextStore()
const authFetch = useAuthFetch()
const { apiErrorMessage } = useApiError()

const categoryItems = SERVICE_CATEGORIES.map(c => ({ label: c.label, value: c.key, icon: c.icon, color: c.color }))
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
  if (!s.name || s.name.trim().length < 2) errors.push({ name: 'name', message: t('onboarding.validation.name') })
  if (!s.categoryKeys.length) errors.push({ name: 'categoryKeys', message: t('onboarding.validation.categories') })
  if (!s.acceptedSpecies.length) errors.push({ name: 'acceptedSpecies', message: t('onboarding.validation.species') })
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
    formError.value = apiErrorMessage(e, 'onboarding.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-xl space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('onboarding.title') }}
      </h1>
      <p class="text-muted text-sm">
        {{ $t('onboarding.subtitle') }}
      </p>
    </div>

    <UForm
      :state="state"
      :validate="validate"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField
        :label="$t('onboarding.fields.name')"
        name="name"
        required
      >
        <UInput
          v-model="state.name"
          :placeholder="$t('onboarding.fields.namePlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="$t('onboarding.fields.categories')"
        name="categoryKeys"
        required
        :hint="$t('onboarding.fields.categoriesHint')"
      >
        <CategorySelect
          v-model="state.categoryKeys"
          :items="categoryItems"
          multiple
          :placeholder="$t('onboarding.fields.categoriesPlaceholder')"
        />
      </UFormField>

      <UFormField
        :label="$t('onboarding.fields.species')"
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
          :label="$t('onboarding.submit')"
          color="primary"
          :loading="loading"
        />
        <UButton
          :label="$t('common.actions.cancel')"
          color="neutral"
          variant="ghost"
          to="/"
        />
      </div>
    </UForm>
  </UContainer>
</template>
