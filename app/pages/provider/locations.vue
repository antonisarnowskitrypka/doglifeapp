<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.locations.metaTitle') })

const ctx = useContextStore()
const authFetch = useAuthFetch()
const toast = useToast()
const { apiErrorMessage } = useApiError()

const orgId = computed(() => ctx.activeContext.membership?.organizationId)
const isOwner = computed(() => ctx.activeContext.membership?.role === 'owner')

const loading = ref(false)
const savingDelivery = ref(false)

// --- Org-level delivery config (the three gates + the single shared travel base/radius) ---
const form = reactive({
  countryCode: 'PL',
  online: { enabled: false },
  atLocation: { enabled: false },
  atClient: { enabled: false, travelRadiusKm: TRAVEL_RADIUS.default }
})
// Travel base is tracked separately: the typed text + the resolved coordinates (null until geocoded).
const baseAddress = ref('')
const basePoint = ref(null)

const locations = ref([])

function pointFromResult(s) {
  return {
    displayName: s.formatted,
    lat: s.lat,
    lng: s.lng,
    city: s.city ?? null,
    postalCode: s.postalCode ?? null,
    countryCode: s.countryCode || form.countryCode,
    precision: s.precision ?? 'street',
    confidence: s.confidence ?? null
  }
}

async function resolveQuery(query) {
  const res = await authFetch('/api/geo/geocode', { method: 'POST', body: { query, countryCode: form.countryCode } })
  return res?.result ?? null
}

async function loadAll() {
  if (!orgId.value || !isOwner.value) return
  loading.value = true
  try {
    const [org, locs] = await Promise.all([
      authFetch(`/api/orgs/${orgId.value}`),
      authFetch(`/api/orgs/${orgId.value}/locations`)
    ])
    const d = org.delivery || {}
    form.countryCode = org.countryCode || 'PL'
    form.online.enabled = !!d.online?.enabled
    form.atLocation.enabled = !!d.atLocation?.enabled
    form.atClient.enabled = !!d.atClient?.enabled
    form.atClient.travelRadiusKm = d.atClient?.travelRadiusKm ?? TRAVEL_RADIUS.default
    if (d.atClient?.base) {
      basePoint.value = pointFromResult({ ...d.atClient.base, formatted: d.atClient.base.displayName || d.atClient.base.address })
      baseAddress.value = d.atClient.base.address || d.atClient.base.displayName || ''
    } else {
      basePoint.value = null
      baseAddress.value = ''
    }
    locations.value = locs.locations || []
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'provider.locations.loadError'), color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ctx.load()
  loadAll()
})
watch(orgId, loadAll)

// Base address typeahead: a pick gives coords directly; typing invalidates the resolved point.
function onBasePick(s) {
  baseAddress.value = s.formatted
  basePoint.value = pointFromResult(s)
}
function onBaseInput(v) {
  baseAddress.value = v
  if (basePoint.value && v !== basePoint.value.displayName) basePoint.value = null
}

async function saveDelivery() {
  if (!orgId.value) return
  savingDelivery.value = true
  try {
    // Geocode-on-save fallback when the provider typed an address but didn't pick a suggestion.
    if (form.atClient.enabled && !basePoint.value && baseAddress.value.trim()) {
      const r = await resolveQuery(baseAddress.value.trim())
      if (r) basePoint.value = pointFromResult(r)
    }
    const base = form.atClient.enabled && basePoint.value
      ? { ...basePoint.value, address: baseAddress.value.trim() || basePoint.value.displayName, sourceQuery: baseAddress.value.trim() }
      : null
    await authFetch(`/api/orgs/${orgId.value}/delivery`, {
      method: 'PATCH',
      body: {
        countryCode: form.countryCode,
        online: { enabled: form.online.enabled },
        atLocation: { enabled: form.atLocation.enabled },
        atClient: { enabled: form.atClient.enabled, travelRadiusKm: form.atClient.travelRadiusKm, base }
      }
    })
    toast.add({ title: t('provider.locations.saved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    savingDelivery.value = false
  }
}

// --- Locations (fixed venues + "in the field" areas) ---
const modal = reactive({ open: false, mode: 'create', saving: false })
const locForm = reactive({
  id: null,
  kind: 'fixed',
  name: '',
  isPublic: true,
  areaRadiusKm: AREA_RADIUS.default,
  addressText: '',
  point: null,
  manual: false,
  manualLat: '',
  manualLng: '',
  color: DEFAULT_CHIP_COLOR,
  icon: defaultChipIcon('fixed'),
  imageUrl: null,
  imageFile: null,
  imagePreview: null
})

const isArea = computed(() => locForm.kind === 'area')
const modalTitle = computed(() => isArea.value ? t('provider.locations.form.areaTitle') : t('provider.locations.form.fixedTitle'))
const locPreviewRadius = computed(() => isArea.value ? locForm.areaRadiusKm : null)
const locPreviewApprox = computed(() => isArea.value || !locForm.isPublic)
const manualPoint = computed(() => {
  const lat = Number(locForm.manualLat)
  const lng = Number(locForm.manualLng)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
})
const previewPoint = computed(() => locForm.manual ? manualPoint.value : locForm.point)
const canSaveLoc = computed(() => {
  if (!locForm.name.trim()) return false
  if (locForm.manual) return !!manualPoint.value
  return !!locForm.point || !!locForm.addressText.trim()
})

function resetLocForm(kind) {
  revokePreview()
  locForm.id = null
  locForm.kind = kind
  locForm.name = ''
  locForm.isPublic = true
  locForm.areaRadiusKm = AREA_RADIUS.default
  locForm.addressText = ''
  locForm.point = null
  locForm.manual = false
  locForm.manualLat = ''
  locForm.manualLng = ''
  locForm.color = DEFAULT_CHIP_COLOR
  locForm.icon = defaultChipIcon(kind)
  locForm.imageUrl = null
  locForm.imageFile = null
  locForm.imagePreview = null
}

function openAdd(kind) {
  resetLocForm(kind)
  modal.mode = 'create'
  modal.open = true
}

function openEdit(loc) {
  revokePreview()
  locForm.id = loc.id
  locForm.kind = loc.kind || 'fixed'
  locForm.name = loc.name || ''
  locForm.isPublic = loc.isPublic !== false
  locForm.areaRadiusKm = loc.areaRadiusKm ?? AREA_RADIUS.default
  locForm.addressText = loc.address || loc.city || ''
  locForm.point = (loc.lat != null && loc.lng != null)
    ? { displayName: loc.displayName, lat: loc.lat, lng: loc.lng, city: loc.city, postalCode: loc.postalCode, countryCode: loc.countryCode, precision: loc.precision, confidence: null }
    : null
  locForm.manual = loc.precision === 'manual'
  locForm.manualLat = loc.lat ?? ''
  locForm.manualLng = loc.lng ?? ''
  locForm.color = loc.color || DEFAULT_CHIP_COLOR
  locForm.icon = loc.icon || defaultChipIcon(loc.kind || 'fixed')
  locForm.imageUrl = loc.imageUrl ?? null
  locForm.imageFile = null
  locForm.imagePreview = loc.imageUrl ?? null
  modal.mode = 'edit'
  modal.open = true
}

function onLocPick(s) {
  locForm.addressText = s.formatted
  locForm.point = pointFromResult(s)
}
function onLocInput(v) {
  locForm.addressText = v
  if (locForm.point && v !== locForm.point.displayName) locForm.point = null
}

async function saveLoc() {
  if (!orgId.value || !canSaveLoc.value) return
  modal.saving = true
  try {
    let point = locForm.manual ? manualPoint.value : locForm.point
    if (!point && !locForm.manual && locForm.addressText.trim()) {
      const r = await resolveQuery(locForm.addressText.trim())
      if (r) point = pointFromResult(r)
    }
    if (!point) {
      toast.add({ title: t('provider.locations.form.notGeocoded'), color: 'warning' })
      return
    }
    const body = {
      kind: locForm.kind,
      name: locForm.name.trim(),
      isPublic: locForm.isPublic,
      areaRadiusKm: isArea.value ? locForm.areaRadiusKm : undefined,
      address: locForm.addressText.trim() || point.displayName || '',
      displayName: point.displayName,
      lat: point.lat,
      lng: point.lng,
      city: point.city ?? null,
      postalCode: point.postalCode ?? null,
      countryCode: point.countryCode ?? form.countryCode,
      precision: point.precision,
      confidence: point.confidence ?? null,
      manual: locForm.manual,
      sourceQuery: locForm.addressText.trim(),
      color: locForm.color,
      icon: locForm.icon
    }
    const res = locForm.id
      ? await authFetch(`/api/orgs/${orgId.value}/locations/${locForm.id}`, { method: 'PATCH', body })
      : await authFetch(`/api/orgs/${orgId.value}/locations`, { method: 'POST', body })
    const saved = res.location
    // A photo picked in the creator uploads once the location exists (needs its id).
    if (locForm.imageFile) {
      try {
        const fd = new FormData()
        fd.append('file', locForm.imageFile)
        const up = await authFetch(`/api/orgs/${orgId.value}/locations/${saved.id}/image`, { method: 'PUT', body: fd })
        saved.imageUrl = up.imageUrl
      } catch {
        // image upload is non-critical — the location is already saved
      }
    }
    const i = locations.value.findIndex(l => l.id === saved.id)
    if (i >= 0) locations.value[i] = saved
    else locations.value.push(saved)
    revokePreview()
    modal.open = false
    toast.add({ title: t('provider.locations.saved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    modal.saving = false
  }
}

// Chip color + icon are chosen from popovers (closed on pick).
const colorOpen = ref(false)
const iconOpen = ref(false)
function pickColor(key) {
  locForm.color = key
  colorOpen.value = false
}
function pickIcon(name) {
  locForm.icon = name
  iconOpen.value = false
}

// Local photo picker — holds the File and a preview; the actual upload happens on save (so a
// photo can be added during creation, before the location has an id).
const fileInput = ref(null)
function revokePreview() {
  if (locForm.imagePreview && locForm.imagePreview.startsWith('blob:')) URL.revokeObjectURL(locForm.imagePreview)
}
function pickImage() {
  fileInput.value?.click()
}
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  revokePreview()
  locForm.imageFile = file
  locForm.imagePreview = URL.createObjectURL(file)
  if (fileInput.value) fileInput.value.value = ''
}
onBeforeUnmount(revokePreview)

// Delete confirmation
const confirmTarget = ref(null)
const deleting = ref(false)
async function doDelete() {
  if (!confirmTarget.value || !orgId.value) return
  deleting.value = true
  try {
    await authFetch(`/api/orgs/${orgId.value}/locations/${confirmTarget.value.id}`, { method: 'DELETE' })
    locations.value = locations.value.filter(l => l.id !== confirmTarget.value.id)
    confirmTarget.value = null
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    deleting.value = false
  }
}

function statusColor(s) {
  if (s === 'ok') return 'success'
  if (s === 'failed') return 'error'
  return 'warning'
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('provider.locations.title') }}
      </h1>
      <p class="text-sm text-muted mt-1">
        {{ $t('provider.locations.subtitle') }}
      </p>
    </div>

    <UAlert
      v-if="!isOwner"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :title="$t('provider.locations.notOwnerTitle')"
      :description="$t('provider.locations.notOwnerDescription')"
    />

    <template v-else>
      <!-- Delivery modes (org-level gates) -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('provider.locations.modesHeading') }}
          </h2>
        </template>

        <div class="space-y-4">
          <!-- Locations / in the field -->
          <div>
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium">
                  {{ $t('provider.locations.atLocation.title') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('provider.locations.atLocation.description') }}
                </p>
              </div>
              <USwitch v-model="form.atLocation.enabled" />
            </div>

            <div
              v-if="form.atLocation.enabled"
              class="mt-4 space-y-3"
            >
              <div
                v-if="!locations.length"
                class="rounded-lg border border-dashed border-default p-4 text-center text-sm text-muted"
              >
                {{ $t('provider.locations.atLocation.empty') }}
              </div>

              <div
                v-for="loc in locations"
                :key="loc.id"
                class="flex items-center gap-3 rounded-lg border border-default p-3"
              >
                <UAvatar
                  :src="loc.imageUrl || undefined"
                  :icon="loc.icon || (loc.kind === 'area' ? 'i-lucide-trees' : 'i-lucide-map-pin')"
                  size="lg"
                  class="shrink-0 rounded-md"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="chipClass(loc.color)"
                    >
                      <UIcon
                        :name="loc.icon || 'i-lucide-map-pin'"
                        class="size-3.5 shrink-0"
                      />
                      <span class="truncate">{{ loc.name }}</span>
                    </span>
                    <UBadge
                      v-if="loc.kind === 'area'"
                      :label="$t('provider.locations.atLocation.areaBadge')"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    />
                  </div>
                  <p class="truncate text-xs text-muted mt-1">
                    {{ loc.address || loc.city || '—' }}
                  </p>
                  <UBadge
                    :label="$t(`geo.status.${loc.geoStatus}`)"
                    :color="statusColor(loc.geoStatus)"
                    variant="subtle"
                    size="sm"
                    class="mt-1"
                  />
                </div>
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="$t('common.actions.edit')"
                  @click="openEdit(loc)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  :aria-label="$t('common.actions.delete')"
                  @click="confirmTarget = loc"
                />
              </div>

              <div class="flex flex-wrap gap-2 pt-1">
                <UButton
                  :label="$t('provider.locations.atLocation.addFixed')"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="openAdd('fixed')"
                />
                <UButton
                  :label="$t('provider.locations.atLocation.addArea')"
                  icon="i-lucide-trees"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="openAdd('area')"
                />
              </div>
            </div>
          </div>

          <USeparator />

          <!-- Travel to client -->
          <div>
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium">
                  {{ $t('provider.locations.atClient.title') }}
                </p>
                <p class="text-sm text-muted">
                  {{ $t('provider.locations.atClient.description') }}
                </p>
              </div>
              <USwitch v-model="form.atClient.enabled" />
            </div>

            <div
              v-if="form.atClient.enabled"
              class="mt-4 space-y-4 rounded-lg border border-default p-4"
            >
              <UFormField :label="$t('provider.locations.atClient.baseAddress')">
                <AppAddressAutocomplete
                  :model-value="baseAddress"
                  :placeholder="$t('provider.locations.atClient.baseAddressPlaceholder')"
                  :country-code="form.countryCode"
                  @update:model-value="onBaseInput"
                  @pick="onBasePick"
                />
              </UFormField>

              <UFormField :label="$t('provider.locations.atClient.radius')">
                <div class="flex items-center gap-4">
                  <USlider
                    v-model="form.atClient.travelRadiusKm"
                    :min="TRAVEL_RADIUS.min"
                    :max="TRAVEL_RADIUS.max"
                    :step="TRAVEL_RADIUS.step"
                    class="flex-1"
                  />
                  <span class="w-16 text-right text-sm font-medium tabular-nums">
                    {{ $t('provider.locations.atClient.radiusValue', { km: form.atClient.travelRadiusKm }) }}
                  </span>
                </div>
              </UFormField>

              <AppStaticMap
                v-if="basePoint"
                :lat="basePoint.lat"
                :lng="basePoint.lng"
                :radius-km="form.atClient.travelRadiusKm"
              />
              <UAlert
                v-else
                color="warning"
                variant="subtle"
                icon="i-lucide-triangle-alert"
                :description="$t('provider.locations.atClient.baseRequired')"
              />
            </div>
          </div>

          <USeparator />

          <!-- Online -->
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="font-medium">
                {{ $t('provider.locations.online.title') }}
              </p>
              <p class="text-sm text-muted">
                {{ $t('provider.locations.online.description') }}
              </p>
            </div>
            <USwitch v-model="form.online.enabled" />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              :label="$t('common.actions.save')"
              color="primary"
              icon="i-lucide-check"
              :loading="savingDelivery"
              @click="saveDelivery"
            />
          </div>
        </template>
      </UCard>
    </template>

    <!-- Location add/edit modal -->
    <UModal
      v-model:open="modal.open"
      :title="modalTitle"
    >
      <template #body>
        <div class="space-y-4">
          <UAlert
            v-if="isArea"
            color="info"
            variant="subtle"
            icon="i-lucide-trees"
            :description="$t('provider.locations.form.areaInfo')"
          />

          <!-- How to set the location: address lookup vs. manual coordinates (segmented, on top). -->
          <div class="grid grid-cols-2 gap-2">
            <UButton
              :label="$t('provider.locations.form.modeAddress')"
              icon="i-lucide-search"
              block
              :color="!locForm.manual ? 'primary' : 'neutral'"
              :variant="!locForm.manual ? 'solid' : 'subtle'"
              @click="locForm.manual = false"
            />
            <UButton
              :label="$t('provider.locations.form.modeCoords')"
              icon="i-lucide-crosshair"
              block
              :color="locForm.manual ? 'primary' : 'neutral'"
              :variant="locForm.manual ? 'solid' : 'subtle'"
              @click="locForm.manual = true"
            />
          </div>

          <UFormField :label="$t('provider.locations.form.name')">
            <UInput
              v-model="locForm.name"
              :placeholder="isArea ? $t('provider.locations.form.namePlaceholderArea') : $t('provider.locations.form.namePlaceholderFixed')"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="!locForm.manual"
            :label="isArea ? $t('provider.locations.form.city') : $t('provider.locations.form.address')"
            :hint="$t('provider.locations.form.geocodeHint')"
          >
            <AppAddressAutocomplete
              :model-value="locForm.addressText"
              :placeholder="isArea ? $t('provider.locations.form.cityPlaceholder') : $t('provider.locations.atClient.baseAddressPlaceholder')"
              :country-code="form.countryCode"
              @update:model-value="onLocInput"
              @pick="onLocPick"
            />
          </UFormField>

          <!-- Manual coordinate escape hatch (shown when the "Współrzędne" mode is active). -->
          <div
            v-if="locForm.manual"
            class="space-y-2"
          >
            <div class="grid grid-cols-2 gap-3">
              <UFormField :label="$t('provider.locations.form.lat')">
                <UInput
                  v-model="locForm.manualLat"
                  type="number"
                  step="0.000001"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('provider.locations.form.lng')">
                <UInput
                  v-model="locForm.manualLng"
                  type="number"
                  step="0.000001"
                  class="w-full"
                />
              </UFormField>
            </div>
            <p class="text-xs text-muted">
              {{ $t('provider.locations.form.manualHint') }}
            </p>
          </div>

          <UFormField
            v-if="isArea"
            :label="$t('provider.locations.form.areaRadius')"
          >
            <div class="flex items-center gap-4">
              <USlider
                v-model="locForm.areaRadiusKm"
                :min="AREA_RADIUS.min"
                :max="AREA_RADIUS.max"
                :step="AREA_RADIUS.step"
                class="flex-1"
              />
              <span class="w-16 text-right text-sm font-medium tabular-nums">
                {{ $t('provider.locations.atClient.radiusValue', { km: locForm.areaRadiusKm }) }}
              </span>
            </div>
          </UFormField>

          <div
            v-if="!isArea"
            class="flex items-center justify-between gap-4"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium">
                {{ $t('provider.locations.form.isPublic') }}
              </p>
              <p class="text-xs text-muted">
                {{ $t('provider.locations.form.isPublicHint') }}
              </p>
            </div>
            <USwitch v-model="locForm.isPublic" />
          </div>

          <!-- Chip color + icon — chosen from popovers (reused later for calendar chips) -->
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="$t('provider.locations.form.color')">
              <UPopover v-model:open="colorOpen">
                <UButton
                  color="neutral"
                  variant="outline"
                  block
                  class="justify-between"
                >
                  <span
                    class="size-4 shrink-0 rounded-full"
                    :class="chipSwatch(locForm.color)"
                  />
                  <span class="flex-1 truncate text-left">{{ $t(`provider.locations.form.colorNames.${locForm.color}`) }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4 shrink-0"
                  />
                </UButton>
                <template #content>
                  <div class="grid grid-cols-5 gap-1.5 p-2">
                    <button
                      v-for="c in CHIP_COLORS"
                      :key="c.key"
                      type="button"
                      class="size-7 rounded-full ring-2 ring-offset-2 ring-offset-default transition"
                      :class="[c.swatch, locForm.color === c.key ? 'ring-primary' : 'ring-transparent']"
                      :aria-label="$t(`provider.locations.form.colorNames.${c.key}`)"
                      @click="pickColor(c.key)"
                    />
                  </div>
                </template>
              </UPopover>
            </UFormField>

            <UFormField :label="$t('provider.locations.form.icon')">
              <UPopover v-model:open="iconOpen">
                <UButton
                  color="neutral"
                  variant="outline"
                  block
                  class="justify-between"
                >
                  <UIcon
                    :name="locForm.icon"
                    class="size-4 shrink-0"
                  />
                  <span class="flex-1 truncate text-left">{{ $t(`provider.locations.form.iconNames.${chipIconId(locForm.icon)}`) }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4 shrink-0"
                  />
                </UButton>
                <template #content>
                  <div class="grid grid-cols-5 gap-1.5 p-2">
                    <button
                      v-for="ic in CHIP_ICONS"
                      :key="ic.id"
                      type="button"
                      class="flex size-9 items-center justify-center rounded-md border transition"
                      :class="locForm.icon === ic.name ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-elevated'"
                      :aria-label="$t(`provider.locations.form.iconNames.${ic.id}`)"
                      @click="pickIcon(ic.name)"
                    >
                      <UIcon
                        :name="ic.name"
                        class="size-4"
                      />
                    </button>
                  </div>
                </template>
              </UPopover>
            </UFormField>
          </div>

          <!-- Live chip preview -->
          <div>
            <p class="text-xs text-muted mb-1">
              {{ $t('provider.locations.form.preview') }}
            </p>
            <span
              class="inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="chipClass(locForm.color)"
            >
              <UIcon
                :name="locForm.icon"
                class="size-3.5 shrink-0"
              />
              <span class="truncate">{{ locForm.name || (isArea ? $t('provider.locations.form.namePlaceholderArea') : $t('provider.locations.form.namePlaceholderFixed')) }}</span>
            </span>
          </div>

          <AppStaticMap
            v-if="previewPoint"
            :lat="previewPoint.lat"
            :lng="previewPoint.lng"
            :radius-km="locPreviewRadius"
            :approximate="locPreviewApprox"
          />
          <UAlert
            v-else
            color="warning"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :description="$t('provider.locations.form.notGeocoded')"
          />

          <UFormField :label="$t('provider.locations.form.image')">
            <div class="flex items-center gap-4">
              <div class="flex size-16 items-center justify-center overflow-hidden rounded-md border border-default bg-elevated">
                <img
                  v-if="locForm.imagePreview"
                  :src="locForm.imagePreview"
                  :alt="locForm.name"
                  class="size-full object-cover"
                >
                <UIcon
                  v-else
                  name="i-lucide-image"
                  class="size-5 text-muted"
                />
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                class="hidden"
                @change="onFileChange"
              >
              <div>
                <UButton
                  :label="locForm.imagePreview ? $t('common.uploader.change') : $t('common.uploader.add')"
                  icon="i-lucide-upload"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="pickImage"
                />
                <p class="text-xs text-muted mt-1">
                  {{ $t('common.uploader.hint') }}
                </p>
              </div>
            </div>
          </UFormField>
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
            :disabled="!canSaveLoc"
            @click="saveLoc"
          />
        </div>
      </template>
    </UModal>

    <!-- Delete confirmation -->
    <UModal
      :open="!!confirmTarget"
      :title="$t('provider.locations.atLocation.deleteConfirmTitle')"
      @update:open="(v) => { if (!v) confirmTarget = null }"
    >
      <template #body>
        <p class="text-sm text-muted">
          {{ $t('provider.locations.atLocation.deleteConfirmBody', { name: confirmTarget?.name }) }}
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
  </UContainer>
</template>
