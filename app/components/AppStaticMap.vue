<script setup>
// Server-proxied static map (no dynamic/interactive maps in MVP — see dev-docs/36). Renders the
// `/api/geo/static-map` image; the secret key stays server-side. Debounced so dragging a radius
// slider re-renders at most once per `debounce` ms; a spinner shows during the debounce + while
// the new image loads.
const props = defineProps({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  // Draws a translucent reach circle (travel radius / area) and frames the zoom to it.
  radiusKm: { type: Number, default: null },
  // Coarse privacy view: no exact pin (home providers / "in the field" areas).
  approximate: { type: Boolean, default: false },
  zoom: { type: Number, default: null },
  alt: { type: String, default: '' },
  debounce: { type: Number, default: 400 }
})

const { t } = useI18n()
const src = ref('')
const failed = ref(false)
const loading = ref(false)
let timer = null

const hasCoords = computed(() => Number.isFinite(props.lat) && Number.isFinite(props.lng))

function build() {
  const p = new URLSearchParams({ lat: String(props.lat), lng: String(props.lng) })
  if (props.radiusKm != null) p.set('radiusKm', String(props.radiusKm))
  if (props.zoom != null) p.set('zoom', String(props.zoom))
  if (props.approximate) p.set('approximate', '1')
  return `/api/geo/static-map?${p.toString()}`
}

function refresh() {
  if (!hasCoords.value) {
    src.value = ''
    loading.value = false
    return
  }
  failed.value = false
  const next = build()
  // An identical URL won't refire <img>'s load event — clear the spinner ourselves.
  if (next === src.value) {
    loading.value = false
    return
  }
  src.value = next
}

// Show the spinner immediately (e.g. as the slider moves), then debounce the actual re-render.
function schedule() {
  clearTimeout(timer)
  if (!hasCoords.value) {
    loading.value = false
    return
  }
  loading.value = true
  timer = setTimeout(refresh, props.debounce)
}

watch(() => [props.lat, props.lng, props.radiusKm, props.approximate, props.zoom], schedule)

onMounted(() => {
  if (hasCoords.value) {
    loading.value = true
    refresh()
  }
})
onBeforeUnmount(() => clearTimeout(timer))

function onLoad() {
  loading.value = false
}
function onError() {
  loading.value = false
  failed.value = true
}
</script>

<template>
  <div class="relative overflow-hidden rounded-lg border border-default bg-elevated aspect-[5/3]">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt || t('geo.map.alt')"
      class="size-full object-cover"
      @load="onLoad"
      @error="onError"
    >
    <div
      v-else-if="!loading"
      class="size-full flex flex-col items-center justify-center gap-2 text-muted text-sm"
    >
      <UIcon
        name="i-lucide-map-pin-off"
        class="size-5"
      />
      {{ t('geo.map.unavailable') }}
    </div>

    <!-- Loading overlay: during the debounce + while the new image fetches. -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-default/50 backdrop-blur-[1px]"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-6 animate-spin text-primary"
      />
    </div>

    <div
      v-if="approximate && src && !failed && !loading"
      class="absolute inset-x-0 bottom-0 bg-default/85 px-2 py-1 text-center text-xs text-muted"
    >
      {{ t('geo.map.approximate') }}
    </div>
  </div>
</template>
