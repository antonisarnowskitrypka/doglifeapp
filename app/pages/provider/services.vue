<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.services.metaTitle') })

const ctx = useContextStore()
const authFetch = useAuthFetch()
const toast = useToast()
const { apiErrorMessage } = useApiError()

const orgId = computed(() => ctx.activeContext.membership?.organizationId)
const isOwner = computed(() => ctx.activeContext.membership?.role === 'owner')

const BOOKING_MODES = ['book_now', 'request', 'inquiry']

const loading = ref(false)
const org = ref(null)
const locations = ref([])
const staff = ref([])
const services = ref([])
const packages = ref([])

const currency = computed(() => org.value?.currency || 'PLN')
const gates = computed(() => ({
  online: !!org.value?.delivery?.online?.enabled,
  atClient: !!org.value?.delivery?.atClient?.enabled,
  atLocation: !!org.value?.delivery?.atLocation?.enabled
}))
const anyGate = computed(() => gates.value.online || gates.value.atClient || gates.value.atLocation)

const categoryItems = computed(() =>
  SERVICE_CATEGORIES.filter(c => (org.value?.categoryKeys || []).includes(c.key)).map(c => ({ label: c.label, value: c.key, icon: c.icon }))
)
const speciesItems = SPECIES.map(s => ({ label: s.label, value: s.key }))
const activeStaff = computed(() => staff.value.filter(m => m.status === 'active'))
const bookingModeItems = computed(() => BOOKING_MODES.map(m => ({ label: t(`provider.services.form.bookingModes.${m}`), value: m })))

function toggleStaff(id) {
  const i = svForm.staffIds.indexOf(id)
  if (i >= 0) svForm.staffIds.splice(i, 1)
  else svForm.staffIds.push(id)
}
// Resolve a service's stored ids to the location/staff objects (for chips on the list).
function serviceLocations(s) {
  return (s.atLocation?.locationIds || []).map(id => locations.value.find(l => l.id === id)).filter(Boolean)
}
function serviceStaff(s) {
  return (s.staffIds || []).map(id => staff.value.find(m => m.membershipId === id)).filter(Boolean)
}
function staffLabel(m) {
  return m.displayName || m.email || '—'
}

function fromMinor(v) {
  return v == null ? '' : (v / 100).toFixed(2)
}
function toMinor(v) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0
}
function minPrice(s) {
  const vals = ['online', 'at_client', 'at_location'].map(k => s.pricing?.[k]).filter(v => v != null)
  return vals.length ? Math.min(...vals) : null
}

async function loadAll() {
  if (!orgId.value || !isOwner.value) return
  loading.value = true
  try {
    const [o, locs, st, svc, pkg] = await Promise.all([
      authFetch(`/api/orgs/${orgId.value}`),
      authFetch(`/api/orgs/${orgId.value}/locations`),
      authFetch(`/api/orgs/${orgId.value}/staff`),
      authFetch(`/api/orgs/${orgId.value}/services`),
      authFetch(`/api/orgs/${orgId.value}/packages`)
    ])
    org.value = o
    locations.value = locs.locations || []
    staff.value = st.members || []
    services.value = svc.services || []
    packages.value = pkg.packages || []
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'provider.services.loadError'), color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ctx.load()
  loadAll()
})
watch(orgId, loadAll)

const servicesByCategory = computed(() => {
  const groups = []
  for (const c of categoryItems.value) {
    const items = services.value.filter(s => s.categoryKey === c.value)
    if (items.length) groups.push({ key: c.value, label: c.label, icon: c.icon, items })
  }
  // A service whose category the org no longer offers still shows, under an "other" bucket.
  const known = new Set(categoryItems.value.map(c => c.value))
  const orphans = services.value.filter(s => !known.has(s.categoryKey))
  if (orphans.length) groups.push({ key: '_other', label: t('provider.services.otherGroup'), icon: 'i-lucide-tag', items: orphans })
  return groups
})

// --- Create / edit modal ---
const modal = reactive({ open: false, saving: false })
const svForm = reactive({
  id: null,
  name: '',
  categoryKey: '',
  shortDescription: '',
  description: '',
  species: [],
  durationMin: 60,
  bufferMin: 0,
  online: { enabled: false, price: '' },
  atClient: { enabled: false, price: '' },
  atLocation: { enabled: false, price: '', locationIds: [] },
  bookingMode: 'book_now',
  staffIds: [],
  cash: false,
  visible: true
})

// Species selector only matters when the org accepts both; otherwise the single species is implied.
const multiSpecies = computed(() => (org.value?.acceptedSpecies?.length ?? 0) > 1)
// What the slot really costs in a staff member's calendar (service duration + operational buffer).
const totalSlotMin = computed(() => (Number(svForm.durationMin) || 0) + (Number(svForm.bufferMin) || 0))

function toggleLocation(id) {
  const i = svForm.atLocation.locationIds.indexOf(id)
  if (i >= 0) svForm.atLocation.locationIds.splice(i, 1)
  else svForm.atLocation.locationIds.push(id)
}

function resetForm() {
  svForm.id = null
  svForm.name = ''
  svForm.categoryKey = categoryItems.value[0]?.value || ''
  svForm.shortDescription = ''
  svForm.description = ''
  svForm.species = [...(org.value?.acceptedSpecies || [])]
  svForm.durationMin = 60
  svForm.bufferMin = 0
  svForm.online = { enabled: false, price: '' }
  svForm.atClient = { enabled: false, price: '' }
  svForm.atLocation = { enabled: false, price: '', locationIds: [] }
  svForm.bookingMode = 'book_now'
  svForm.staffIds = []
  svForm.cash = false
  svForm.visible = true
}

function openAdd() {
  resetForm()
  modal.open = true
}

function openEdit(s) {
  svForm.id = s.id
  svForm.name = s.name
  svForm.categoryKey = s.categoryKey
  svForm.shortDescription = s.shortDescription || ''
  svForm.description = s.description || ''
  svForm.species = [...(s.species || [])]
  svForm.durationMin = s.durationMin || 60
  svForm.bufferMin = s.operationalBufferMinutes || 0
  svForm.online = { enabled: s.online?.enabled || false, price: fromMinor(s.pricing?.online) }
  svForm.atClient = { enabled: s.atClient?.enabled || false, price: fromMinor(s.pricing?.at_client) }
  svForm.atLocation = {
    enabled: (s.deliveryModes || []).includes('at_location'),
    price: fromMinor(s.pricing?.at_location),
    locationIds: [...(s.atLocation?.locationIds || [])]
  }
  svForm.bookingMode = s.bookingMode || 'book_now'
  svForm.staffIds = [...(s.staffIds || [])]
  svForm.cash = (s.paymentMethods || []).includes('cash')
  svForm.visible = s.status !== 'hidden'
  modal.open = true
}

const enabledModes = computed(() => {
  const m = []
  if (gates.value.online && svForm.online.enabled) m.push('online')
  if (gates.value.atClient && svForm.atClient.enabled) m.push('at_client')
  if (gates.value.atLocation && svForm.atLocation.enabled) m.push('at_location')
  return m
})
function priceOk(v) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0
}
const canSave = computed(() => {
  if (svForm.name.trim().length < 2 || !svForm.categoryKey) return false
  if (!enabledModes.value.length) return false
  if (svForm.online.enabled && !priceOk(svForm.online.price)) return false
  if (svForm.atClient.enabled && !priceOk(svForm.atClient.price)) return false
  if (svForm.atLocation.enabled && (!priceOk(svForm.atLocation.price) || !svForm.atLocation.locationIds.length)) return false
  return true
})

async function save() {
  if (!orgId.value || !canSave.value) return
  modal.saving = true
  try {
    const body = {
      name: svForm.name.trim(),
      categoryKey: svForm.categoryKey,
      shortDescription: svForm.shortDescription.trim() || null,
      description: svForm.description.trim() || null,
      species: svForm.species,
      durationMin: Math.round(Number(svForm.durationMin) || 60),
      operationalBufferMinutes: Math.max(0, Math.round(Number(svForm.bufferMin) || 0)),
      paymentMethods: svForm.cash ? ['online', 'cash'] : ['online'],
      online: { enabled: gates.value.online && svForm.online.enabled },
      atClient: { enabled: gates.value.atClient && svForm.atClient.enabled },
      atLocation: { enabled: gates.value.atLocation && svForm.atLocation.enabled, locationIds: svForm.atLocation.locationIds },
      pricing: {
        online: svForm.online.enabled ? toMinor(svForm.online.price) : undefined,
        at_client: svForm.atClient.enabled ? toMinor(svForm.atClient.price) : undefined,
        at_location: svForm.atLocation.enabled ? toMinor(svForm.atLocation.price) : undefined
      },
      bookingMode: svForm.bookingMode,
      staffIds: svForm.staffIds,
      status: svForm.visible ? 'active' : 'hidden'
    }
    const res = svForm.id
      ? await authFetch(`/api/orgs/${orgId.value}/services/${svForm.id}`, { method: 'PATCH', body })
      : await authFetch(`/api/orgs/${orgId.value}/services`, { method: 'POST', body })
    const saved = res.service
    const i = services.value.findIndex(s => s.id === saved.id)
    if (i >= 0) services.value[i] = saved
    else services.value.push(saved)
    modal.open = false
    toast.add({ title: t('provider.services.saved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    modal.saving = false
  }
}

// --- Booking form editor (separate modal: required handling fields + custom questions) ---
const formModal = reactive({ open: false, saving: false, service: null, requiredPetQuestions: [], customQuestions: [] })

// A service "has a form" once it requires any handling field or defines any custom question.
function hasForm(s) {
  return (s.requiredPetQuestions?.length || 0) > 0 || (s.customQuestions?.length || 0) > 0
}
function openFormEditor(s) {
  formModal.service = s
  formModal.requiredPetQuestions = [...(s.requiredPetQuestions || [])]
  formModal.customQuestions = (s.customQuestions || []).map(q => ({ ...q, options: [...(q.options || [])] }))
  formModal.open = true
}

// Catalogue questions grouped + filtered to the edited service's species (e.g. hide in_heat for cats).
const formSpecies = computed(() => formModal.service?.species || [])
function questionVisible(q) {
  return !q.species || q.species.some(s => formSpecies.value.includes(s))
}
const handlingGroups = computed(() =>
  HANDLING_GROUPS
    .map(g => ({ key: g, questions: HANDLING_CATALOGUE.filter(q => q.group === g && questionVisible(q)) }))
    .filter(g => g.questions.length)
)
function isRequired(key) {
  return formModal.requiredPetQuestions.includes(key)
}
function toggleRequired(key) {
  const i = formModal.requiredPetQuestions.indexOf(key)
  if (i >= 0) formModal.requiredPetQuestions.splice(i, 1)
  else formModal.requiredPetQuestions.push(key)
}
const customTypeItems = computed(() => CUSTOM_QUESTION_TYPES.map(tp => ({ value: tp, label: t(`handling.customTypes.${tp}`) })))
function addCustomQuestion() {
  formModal.customQuestions.push({ id: crypto.randomUUID(), label: '', type: 'short_text', options: [], required: false })
}
function removeCustomQuestion(i) {
  formModal.customQuestions.splice(i, 1)
}
function setOptions(q, value) {
  q.options = value.split('\n').map(s => s.trim()).filter(Boolean)
}

// "Kopiuj z" — borrow another service's form config (other services that already have one).
const copyOpen = ref(false)
const copyableServices = computed(() => services.value.filter(s => s.id !== formModal.service?.id && hasForm(s)))
function copyFormFrom(src) {
  formModal.requiredPetQuestions = [...(src.requiredPetQuestions || [])]
  formModal.customQuestions = (src.customQuestions || []).map(q => ({ ...q, id: crypto.randomUUID(), options: [...(q.options || [])] }))
  copyOpen.value = false
}

async function saveForm() {
  if (!orgId.value || !formModal.service) return
  formModal.saving = true
  try {
    const res = await authFetch(`/api/orgs/${orgId.value}/services/${formModal.service.id}`, {
      method: 'PATCH',
      body: { requiredPetQuestions: formModal.requiredPetQuestions, customQuestions: formModal.customQuestions }
    })
    const saved = res.service
    const i = services.value.findIndex(s => s.id === saved.id)
    if (i >= 0) services.value[i] = saved
    formModal.open = false
    toast.add({ title: t('provider.services.saved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    formModal.saving = false
  }
}

// Delete confirmation
const confirmTarget = ref(null)
const deleting = ref(false)
async function doDelete() {
  if (!confirmTarget.value || !orgId.value) return
  deleting.value = true
  try {
    await authFetch(`/api/orgs/${orgId.value}/services/${confirmTarget.value.id}`, { method: 'DELETE' })
    services.value = services.value.filter(s => s.id !== confirmTarget.value.id)
    confirmTarget.value = null
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    deleting.value = false
  }
}

// --- Packages (bundles of interchangeable sessions, same tab as services) ---
const serviceSelectItems = computed(() => services.value.map(s => ({ label: s.name, value: s.id })))
// Resolve a package's stored service ids to service objects (for badges on the list).
function packageServices(p) {
  return (p.serviceIds || []).map(id => services.value.find(s => s.id === id)).filter(Boolean)
}

const pkgModal = reactive({ open: false, saving: false })
const pkgForm = reactive({ id: null, name: '', description: '', sessionCount: 5, price: '', serviceIds: [], visible: true })

function openPkgAdd() {
  pkgForm.id = null
  pkgForm.name = ''
  pkgForm.description = ''
  pkgForm.sessionCount = 5
  pkgForm.price = ''
  pkgForm.serviceIds = []
  pkgForm.visible = true
  pkgModal.open = true
}
function openPkgEdit(p) {
  pkgForm.id = p.id
  pkgForm.name = p.name
  pkgForm.description = p.description || ''
  pkgForm.sessionCount = p.sessionCount || 1
  pkgForm.price = fromMinor(p.price)
  pkgForm.serviceIds = [...(p.serviceIds || [])]
  pkgForm.visible = p.status !== 'hidden'
  pkgModal.open = true
}

const canSavePkg = computed(() =>
  pkgForm.name.trim().length >= 2 && Number(pkgForm.sessionCount) >= 1 && priceOk(pkgForm.price) && pkgForm.serviceIds.length > 0
)

async function savePkg() {
  if (!orgId.value || !canSavePkg.value) return
  pkgModal.saving = true
  try {
    const body = {
      name: pkgForm.name.trim(),
      description: pkgForm.description.trim() || null,
      sessionCount: Math.round(Number(pkgForm.sessionCount) || 1),
      price: toMinor(pkgForm.price),
      serviceIds: pkgForm.serviceIds,
      status: pkgForm.visible ? 'active' : 'hidden'
    }
    const res = pkgForm.id
      ? await authFetch(`/api/orgs/${orgId.value}/packages/${pkgForm.id}`, { method: 'PATCH', body })
      : await authFetch(`/api/orgs/${orgId.value}/packages`, { method: 'POST', body })
    const saved = res.package
    const i = packages.value.findIndex(p => p.id === saved.id)
    if (i >= 0) packages.value[i] = saved
    else packages.value.push(saved)
    pkgModal.open = false
    toast.add({ title: t('provider.services.packageSaved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    pkgModal.saving = false
  }
}

const pkgConfirmTarget = ref(null)
const pkgDeleting = ref(false)
async function doDeletePkg() {
  if (!pkgConfirmTarget.value || !orgId.value) return
  pkgDeleting.value = true
  try {
    await authFetch(`/api/orgs/${orgId.value}/packages/${pkgConfirmTarget.value.id}`, { method: 'DELETE' })
    packages.value = packages.value.filter(p => p.id !== pkgConfirmTarget.value.id)
    pkgConfirmTarget.value = null
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    pkgDeleting.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          {{ $t('provider.services.title') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ $t('provider.services.subtitle') }}
        </p>
      </div>
      <UButton
        v-if="isOwner && anyGate"
        :label="$t('provider.services.add')"
        icon="i-lucide-plus"
        color="primary"
        class="shrink-0"
        @click="openAdd"
      />
    </div>

    <UAlert
      v-if="!isOwner"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :title="$t('provider.services.notOwnerTitle')"
      :description="$t('provider.services.notOwnerDescription')"
    />

    <template v-else>
      <UAlert
        v-if="!anyGate"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="$t('provider.services.noGatesTitle')"
        :description="$t('provider.services.noGatesDescription')"
        :actions="[{ label: $t('nav.companySettings.locations'), to: '/provider/locations', color: 'neutral', variant: 'outline' }]"
      />

      <div
        v-else-if="!services.length"
        class="rounded-lg border border-dashed border-default p-8 text-center text-sm text-muted"
      >
        {{ $t('provider.services.empty') }}
      </div>

      <div
        v-for="group in servicesByCategory"
        :key="group.key"
        class="space-y-2"
      >
        <h2 class="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wide">
          <UIcon
            :name="group.icon"
            class="size-4"
          />
          {{ group.label }}
        </h2>

        <div
          v-for="s in group.items"
          :key="s.id"
          class="rounded-lg border border-default p-3"
        >
          <div class="flex items-start gap-2">
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 font-medium">
                <span class="truncate">{{ s.name }}</span>
                <UBadge
                  v-if="s.status === 'hidden'"
                  :label="$t('provider.services.hiddenBadge')"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </p>
              <p
                v-if="s.shortDescription"
                class="text-xs text-muted mt-0.5 line-clamp-1"
              >
                {{ s.shortDescription }}
              </p>
            </div>
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="$t('common.actions.edit')"
              @click="openEdit(s)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :aria-label="$t('common.actions.delete')"
              @click="confirmTarget = s"
            />
          </div>

          <USeparator class="my-2" />

          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-xs text-muted">
                {{ $t('provider.services.perDuration', { min: s.durationMin }) }}
                <template v-if="minPrice(s) != null">
                  · {{ $t('common.labels.from') }} {{ fromMinor(minPrice(s)) }} {{ currency }}
                </template>
              </p>

              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                <UBadge
                  v-if="s.online?.enabled"
                  :label="$t('provider.services.form.online')"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
                <UBadge
                  v-if="s.atClient?.enabled"
                  :label="$t('provider.services.form.atClient')"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
                <AppChip
                  v-for="loc in serviceLocations(s)"
                  :key="loc.id"
                  :color="loc.color"
                  :icon="loc.icon || 'i-lucide-map-pin'"
                  :label="loc.name"
                />
              </div>

              <div
                v-if="serviceStaff(s).length"
                class="flex flex-wrap gap-1.5 mt-1.5"
              >
                <AppChip
                  v-for="m in serviceStaff(s)"
                  :key="m.membershipId"
                  :color="m.color || ''"
                  :avatar="m.avatarUrl || ''"
                  :label="staffLabel(m)"
                />
              </div>
            </div>

            <div class="flex shrink-0 flex-col items-end gap-2">
              <UButton
                :label="hasForm(s) ? $t('provider.services.form.editFormButton') : $t('provider.services.form.addFormButton')"
                :icon="hasForm(s) ? 'i-lucide-clipboard-list' : 'i-lucide-clipboard-plus'"
                :color="hasForm(s) ? 'neutral' : 'primary'"
                variant="outline"
                size="xs"
                @click="openFormEditor(s)"
              />
              <UButton
                :label="$t('provider.services.form.sessionSchemaButton')"
                icon="i-lucide-workflow"
                color="neutral"
                variant="outline"
                size="xs"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Packages: bundles of interchangeable sessions, same tab as services -->
      <div
        v-if="services.length || packages.length"
        class="space-y-2"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wide">
            <UIcon
              name="i-lucide-package"
              class="size-4"
            />
            {{ $t('provider.services.packagesHeading') }}
          </h2>
          <UButton
            :label="$t('provider.services.addPackage')"
            icon="i-lucide-plus"
            color="primary"
            variant="outline"
            size="xs"
            @click="openPkgAdd"
          />
        </div>

        <div
          v-if="!packages.length"
          class="rounded-lg border border-dashed border-default p-6 text-center text-sm text-muted"
        >
          {{ $t('provider.services.packageEmpty') }}
        </div>

        <div
          v-for="p in packages"
          :key="p.id"
          class="rounded-lg border border-default p-3"
        >
          <div class="flex items-start gap-2">
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 font-medium">
                <span class="truncate">{{ p.name }}</span>
                <UBadge
                  v-if="p.status === 'hidden'"
                  :label="$t('provider.services.hiddenBadge')"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </p>
              <p
                v-if="p.description"
                class="text-xs text-muted mt-0.5 line-clamp-1"
              >
                {{ p.description }}
              </p>
            </div>
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="$t('common.actions.edit')"
              @click="openPkgEdit(p)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :aria-label="$t('common.actions.delete')"
              @click="pkgConfirmTarget = p"
            />
          </div>

          <USeparator class="my-2" />

          <p class="text-xs text-muted">
            {{ $t('provider.services.packageSessions', { count: p.sessionCount }) }}
            <template v-if="p.price">
              · {{ fromMinor(p.price) }} {{ currency }}
            </template>
          </p>

          <div
            v-if="packageServices(p).length"
            class="flex flex-wrap gap-1.5 mt-1.5"
          >
            <UBadge
              v-for="s in packageServices(p)"
              :key="s.id"
              :label="s.name"
              color="neutral"
              variant="subtle"
              size="sm"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Create / edit modal -->
    <UModal
      v-model:open="modal.open"
      :title="svForm.id ? $t('provider.services.form.editTitle') : $t('provider.services.form.createTitle')"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField :label="$t('provider.services.form.name')">
            <UInput
              v-model="svForm.name"
              :placeholder="$t('provider.services.form.namePlaceholder')"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="$t('provider.services.form.shortDescription')"
            :hint="$t('provider.services.form.shortDescriptionHint')"
          >
            <UInput
              v-model="svForm.shortDescription"
              :maxlength="160"
              :placeholder="$t('provider.services.form.shortDescriptionPlaceholder')"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('provider.services.form.category')">
            <USelectMenu
              v-model="svForm.categoryKey"
              :items="categoryItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField :label="$t('provider.services.form.duration')">
                <UInput
                  v-model="svForm.durationMin"
                  type="number"
                  min="5"
                  step="5"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('provider.services.form.buffer')">
                <UInput
                  v-model="svForm.bufferMin"
                  type="number"
                  min="0"
                  step="5"
                  class="w-full"
                />
              </UFormField>
            </div>
            <p class="text-xs text-muted mt-1.5">
              {{ $t('provider.services.form.totalTime', { min: totalSlotMin }) }}
            </p>
          </div>

          <UFormField
            :label="$t('provider.services.form.description')"
            :hint="$t('provider.services.form.descriptionHint')"
          >
            <UTextarea
              v-model="svForm.description"
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="multiSpecies"
            :label="$t('provider.services.form.species')"
          >
            <UCheckboxGroup
              v-model="svForm.species"
              :items="speciesItems"
              value-key="value"
              orientation="horizontal"
            />
          </UFormField>

          <!-- Delivery modes + pricing (only modes enabled at org level) -->
          <div class="space-y-3 rounded-lg border border-default p-4">
            <p class="text-sm font-semibold">
              {{ $t('provider.services.form.deliveryHeading') }}
            </p>

            <div
              v-if="gates.online"
              class="space-y-2"
            >
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ $t('provider.services.form.online') }}</span>
                <USwitch v-model="svForm.online.enabled" />
              </div>
              <UInput
                v-if="svForm.online.enabled"
                v-model="svForm.online.price"
                type="number"
                min="0"
                step="0.01"
                :placeholder="$t('provider.services.form.price')"
                class="w-full"
              >
                <template #trailing>
                  <span class="text-xs text-muted">{{ currency }}</span>
                </template>
              </UInput>
            </div>

            <div
              v-if="gates.atClient"
              class="space-y-2"
            >
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ $t('provider.services.form.atClient') }}</span>
                <USwitch v-model="svForm.atClient.enabled" />
              </div>
              <template v-if="svForm.atClient.enabled">
                <UInput
                  v-model="svForm.atClient.price"
                  type="number"
                  min="0"
                  step="0.01"
                  :placeholder="$t('provider.services.form.price')"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-xs text-muted">{{ currency }}</span>
                  </template>
                </UInput>
                <p class="text-xs text-muted">
                  {{ $t('provider.services.form.atClientHint') }}
                </p>
              </template>
            </div>

            <div
              v-if="gates.atLocation"
              class="space-y-2"
            >
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ $t('provider.services.form.atLocation') }}</span>
                <USwitch v-model="svForm.atLocation.enabled" />
              </div>
              <template v-if="svForm.atLocation.enabled">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="loc in locations"
                    :key="loc.id"
                    type="button"
                    class="rounded-full transition"
                    :class="svForm.atLocation.locationIds.includes(loc.id) ? '' : 'opacity-60 hover:opacity-100'"
                    @click="toggleLocation(loc.id)"
                  >
                    <AppChip
                      :color="loc.color"
                      :icon="loc.icon || 'i-lucide-map-pin'"
                      :label="loc.name"
                      :muted="!svForm.atLocation.locationIds.includes(loc.id)"
                    />
                  </button>
                  <span
                    v-if="!locations.length"
                    class="text-xs text-muted"
                  >{{ $t('provider.services.form.noLocations') }}</span>
                </div>
                <UInput
                  v-model="svForm.atLocation.price"
                  type="number"
                  min="0"
                  step="0.01"
                  :placeholder="$t('provider.services.form.price')"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-xs text-muted">{{ currency }}</span>
                  </template>
                </UInput>
              </template>
            </div>

            <p
              v-if="!enabledModes.length"
              class="text-xs text-warning"
            >
              {{ $t('provider.services.form.deliveryRequired') }}
            </p>
          </div>

          <UFormField
            :label="$t('provider.services.form.bookingMode')"
            :hint="$t('provider.services.form.bookingModeHint')"
          >
            <USelectMenu
              v-model="svForm.bookingMode"
              :items="bookingModeItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="$t('provider.services.form.staff')"
            :hint="$t('provider.services.form.staffAllHint')"
          >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="m in activeStaff"
                :key="m.membershipId"
                type="button"
                class="rounded-full transition"
                :class="svForm.staffIds.includes(m.membershipId) ? '' : 'opacity-60 hover:opacity-100'"
                @click="toggleStaff(m.membershipId)"
              >
                <AppChip
                  :color="m.color || ''"
                  :avatar="m.avatarUrl || ''"
                  :label="staffLabel(m)"
                  :muted="!svForm.staffIds.includes(m.membershipId)"
                />
              </button>
              <span
                v-if="!activeStaff.length"
                class="text-xs text-muted"
              >{{ $t('provider.services.form.noStaff') }}</span>
            </div>
          </UFormField>

          <UFormField :label="$t('provider.services.form.paymentMethods')">
            <div class="space-y-2">
              <UCheckbox
                :model-value="true"
                disabled
                :label="$t('provider.services.form.paymentOnline')"
              />
              <UCheckbox
                v-model="svForm.cash"
                :label="$t('provider.services.form.paymentCash')"
              />
              <p class="text-xs text-muted">
                {{ $t('provider.services.form.paymentMoreHint') }}
              </p>
            </div>
          </UFormField>

          <div class="flex items-center justify-between gap-4">
            <span class="text-sm font-medium">{{ $t('provider.services.form.visible') }}</span>
            <USwitch v-model="svForm.visible" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="$t('common.actions.cancel')"
            color="neutral"
            variant="ghost"
            @click="modal.open = false"
          />
          <UButton
            :label="$t('common.actions.save')"
            color="primary"
            icon="i-lucide-check"
            :loading="modal.saving"
            :disabled="!canSave"
            @click="save"
          />
        </div>
      </template>
    </UModal>

    <!-- Booking form editor (dedicated modal: required handling fields + custom questions) -->
    <UModal
      v-model:open="formModal.open"
      :title="$t('provider.services.form.formModalTitle', { name: formModal.service?.name || '' })"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{ $t('provider.services.form.formHint') }}
          </p>

          <!-- Section 1: which catalogue (handling) fields this service requires -->
          <div class="space-y-3">
            <p class="text-sm font-medium">
              {{ $t('provider.services.form.handlingHeading') }}
            </p>
            <div
              v-for="g in handlingGroups"
              :key="g.key"
              class="space-y-1.5"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
                {{ $t(`handling.groups.${g.key}`) }}
              </p>
              <div class="grid gap-1.5 sm:grid-cols-2">
                <UCheckbox
                  v-for="q in g.questions"
                  :key="q.key"
                  :model-value="isRequired(q.key)"
                  :label="$t(`handling.q.${q.key}`)"
                  @update:model-value="toggleRequired(q.key)"
                />
              </div>
            </div>
          </div>

          <USeparator />

          <!-- Section 2: provider-authored questions answered fresh each booking -->
          <div class="space-y-3">
            <div>
              <p class="text-sm font-medium">
                {{ $t('provider.services.form.customHeading') }}
              </p>
              <p class="text-xs text-muted mt-0.5">
                {{ $t('provider.services.form.customHint') }}
              </p>
            </div>

            <div
              v-for="(q, i) in formModal.customQuestions"
              :key="q.id"
              class="space-y-2 rounded-lg border border-default p-3"
            >
              <div class="flex items-start gap-2">
                <UInput
                  v-model="q.label"
                  :placeholder="$t('provider.services.form.customLabelPlaceholder')"
                  class="flex-1"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  :aria-label="$t('common.actions.delete')"
                  @click="removeCustomQuestion(i)"
                />
              </div>
              <div class="grid items-center gap-2 sm:grid-cols-2">
                <USelectMenu
                  v-model="q.type"
                  :items="customTypeItems"
                  value-key="value"
                  class="w-full"
                />
                <div class="flex items-center justify-end gap-2">
                  <span class="text-sm text-muted">{{ $t('provider.services.form.customRequired') }}</span>
                  <USwitch v-model="q.required" />
                </div>
              </div>
              <UFormField
                v-if="isChoiceQuestion(q.type)"
                :label="$t('provider.services.form.customOptions')"
                :hint="$t('provider.services.form.customOptionsHint')"
              >
                <UTextarea
                  :model-value="(q.options || []).join('\n')"
                  :rows="3"
                  class="w-full"
                  @update:model-value="v => setOptions(q, v)"
                />
              </UFormField>
            </div>

            <p
              v-if="!formModal.customQuestions.length"
              class="text-xs text-muted"
            >
              {{ $t('provider.services.form.customEmpty') }}
            </p>
            <UButton
              :label="$t('provider.services.form.customAdd')"
              icon="i-lucide-plus"
              color="neutral"
              variant="outline"
              size="sm"
              @click="addCustomQuestion"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full items-center justify-between gap-2">
          <UPopover v-model:open="copyOpen">
            <UButton
              :label="$t('provider.services.form.copyFrom')"
              icon="i-lucide-copy"
              trailing-icon="i-lucide-chevron-down"
              color="neutral"
              variant="outline"
              size="sm"
            />
            <template #content>
              <div class="max-h-64 min-w-56 overflow-auto p-1">
                <button
                  v-for="s in copyableServices"
                  :key="s.id"
                  type="button"
                  class="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-elevated"
                  @click="copyFormFrom(s)"
                >
                  <span class="truncate">{{ s.name }}</span>
                  <span class="shrink-0 text-xs text-dimmed">
                    {{ (s.requiredPetQuestions?.length || 0) + (s.customQuestions?.length || 0) }}
                  </span>
                </button>
                <p
                  v-if="!copyableServices.length"
                  class="px-2 py-1.5 text-xs text-muted"
                >
                  {{ $t('provider.services.form.copyEmpty') }}
                </p>
              </div>
            </template>
          </UPopover>

          <div class="flex gap-2">
            <UButton
              :label="$t('common.actions.cancel')"
              color="neutral"
              variant="ghost"
              @click="formModal.open = false"
            />
            <UButton
              :label="$t('common.actions.save')"
              color="primary"
              icon="i-lucide-check"
              :loading="formModal.saving"
              @click="saveForm"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete confirmation -->
    <UModal
      :open="!!confirmTarget"
      :title="$t('provider.services.deleteConfirmTitle')"
      @update:open="(v) => { if (!v) confirmTarget = null }"
    >
      <template #body>
        <p class="text-sm text-muted">
          {{ $t('provider.services.deleteConfirmBody', { name: confirmTarget?.name }) }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="$t('common.actions.cancel')"
            color="neutral"
            variant="ghost"
            @click="confirmTarget = null"
          />
          <UButton
            :label="$t('common.actions.delete')"
            color="error"
            icon="i-lucide-trash-2"
            :loading="deleting"
            @click="doDelete"
          />
        </div>
      </template>
    </UModal>

    <!-- Package create / edit modal -->
    <UModal
      v-model:open="pkgModal.open"
      :title="pkgForm.id ? $t('provider.services.pkgForm.editTitle') : $t('provider.services.pkgForm.createTitle')"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField :label="$t('provider.services.pkgForm.name')">
            <UInput
              v-model="pkgForm.name"
              :placeholder="$t('provider.services.pkgForm.namePlaceholder')"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="$t('provider.services.pkgForm.description')"
            :hint="$t('common.labels.optional')"
          >
            <UTextarea
              v-model="pkgForm.description"
              :rows="2"
              autoresize
              class="w-full"
            />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="$t('provider.services.pkgForm.sessionCount')">
              <UInput
                v-model="pkgForm.sessionCount"
                type="number"
                min="1"
                step="1"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="$t('provider.services.pkgForm.price')">
              <UInput
                v-model="pkgForm.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full"
              >
                <template #trailing>
                  <span class="text-xs text-muted">{{ currency }}</span>
                </template>
              </UInput>
            </UFormField>
          </div>

          <UFormField
            :label="$t('provider.services.pkgForm.services')"
            :hint="$t('provider.services.pkgForm.servicesHint')"
          >
            <USelectMenu
              v-model="pkgForm.serviceIds"
              :items="serviceSelectItems"
              value-key="value"
              multiple
              class="w-full"
              :placeholder="$t('provider.services.pkgForm.servicesPlaceholder')"
            />
            <p
              v-if="!services.length"
              class="text-xs text-muted mt-1"
            >
              {{ $t('provider.services.pkgForm.noServices') }}
            </p>
          </UFormField>

          <div class="flex items-center justify-between gap-4">
            <span class="text-sm font-medium">{{ $t('provider.services.pkgForm.visible') }}</span>
            <USwitch v-model="pkgForm.visible" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="$t('common.actions.cancel')"
            color="neutral"
            variant="ghost"
            @click="pkgModal.open = false"
          />
          <UButton
            :label="$t('common.actions.save')"
            color="primary"
            icon="i-lucide-check"
            :loading="pkgModal.saving"
            :disabled="!canSavePkg"
            @click="savePkg"
          />
        </div>
      </template>
    </UModal>

    <!-- Package delete confirmation -->
    <UModal
      :open="!!pkgConfirmTarget"
      :title="$t('provider.services.packageDeleteConfirmTitle')"
      @update:open="(v) => { if (!v) pkgConfirmTarget = null }"
    >
      <template #body>
        <p class="text-sm text-muted">
          {{ $t('provider.services.packageDeleteConfirmBody', { name: pkgConfirmTarget?.name }) }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="$t('common.actions.cancel')"
            color="neutral"
            variant="ghost"
            @click="pkgConfirmTarget = null"
          />
          <UButton
            :label="$t('common.actions.delete')"
            color="error"
            icon="i-lucide-trash-2"
            :loading="pkgDeleting"
            @click="doDeletePkg"
          />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
