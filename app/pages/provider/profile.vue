<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.profile.metaTitle') })

const ctx = useContextStore()
const authFetch = useAuthFetch()
const toast = useToast()
const { apiErrorMessage } = useApiError()

const orgId = computed(() => ctx.activeContext.membership?.organizationId)
const isOwner = computed(() => ctx.activeContext.membership?.role === 'owner')

const categoryItems = SERVICE_CATEGORIES.map(c => ({ label: c.label, value: c.key, icon: c.icon, color: c.color }))
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
    toast.add({ title: apiErrorMessage(e, 'provider.profile.loadError'), color: 'error' })
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
    toast.add({ title: t('provider.profile.saved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <h1 class="text-2xl font-bold text-highlighted">
      {{ $t('provider.profile.title') }}
    </h1>

    <UAlert
      v-if="!isOwner"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :title="$t('provider.profile.notOwnerTitle')"
      :description="$t('provider.profile.notOwnerDescription')"
    />

    <template v-else>
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('provider.profile.companyHeading') }}
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

          <UFormField :label="$t('provider.profile.name')">
            <UInput
              v-model="form.name"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="$t('provider.profile.description')"
            :hint="$t('provider.profile.descriptionHint')"
          >
            <UTextarea
              v-model="form.description"
              :rows="4"
              autoresize
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('provider.profile.categories')">
            <CategorySelect
              v-model="form.categoryKeys"
              :items="categoryItems"
              multiple
            />
          </UFormField>

          <UFormField :label="$t('provider.profile.species')">
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
            {{ $t('provider.profile.invoiceHeading') }}
          </h2>
        </template>
        <div class="space-y-4">
          <UFormField :label="$t('provider.profile.invoiceName')">
            <UInput
              v-model="form.company.name"
              class="w-full"
            />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="$t('provider.profile.taxId')">
              <UInput
                v-model="form.company.taxId"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="$t('provider.profile.address')">
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
          :label="$t('common.actions.save')"
          color="primary"
          icon="i-lucide-check"
          :loading="saving"
          @click="save"
        />
      </div>
    </template>
  </UContainer>
</template>
