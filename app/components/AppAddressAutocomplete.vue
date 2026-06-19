<script setup>
// Address typeahead for the provider location form (dev-docs/36). Hits `/api/geo/autocomplete`
// (server-proxied Geoapify) and emits the picked, already-geocoded result — so we store its
// coordinates directly without a second geocode. Searcher-side autocomplete is parked (post-MVP).
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  countryCode: { type: String, default: 'PL' },
  icon: { type: String, default: 'i-lucide-map-pin' },
  debounce: { type: Number, default: 300 }
})
const emit = defineEmits(['update:modelValue', 'pick'])

const authFetch = useAuthFetch()
const text = ref(props.modelValue)
watch(() => props.modelValue, (v) => {
  if (v !== text.value) text.value = v
})

const suggestions = ref([])
const open = ref(false)
const loading = ref(false)
let timer = null
let seq = 0

async function fetchSuggestions(q) {
  const my = ++seq
  loading.value = true
  try {
    const res = await authFetch('/api/geo/autocomplete', { method: 'POST', body: { query: q, countryCode: props.countryCode } })
    if (my !== seq) return
    suggestions.value = res?.suggestions ?? []
    open.value = suggestions.value.length > 0
  } catch {
    if (my !== seq) return
    suggestions.value = []
    open.value = false
  } finally {
    if (my === seq) loading.value = false
  }
}

function onInput(v) {
  text.value = v
  emit('update:modelValue', v)
  clearTimeout(timer)
  if (!v || v.trim().length < 3) {
    suggestions.value = []
    open.value = false
    return
  }
  timer = setTimeout(() => fetchSuggestions(v.trim()), props.debounce)
}

function choose(s) {
  text.value = s.formatted
  emit('update:modelValue', s.formatted)
  emit('pick', s)
  open.value = false
  suggestions.value = []
}

// Delay close so a suggestion click (mousedown) registers before blur hides the list.
function onBlur() {
  setTimeout(() => {
    open.value = false
  }, 150)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="relative">
    <UInput
      :model-value="text"
      :placeholder="placeholder"
      :icon="icon"
      :loading="loading"
      autocomplete="off"
      class="w-full"
      @update:model-value="onInput"
      @focus="open = suggestions.length > 0"
      @blur="onBlur"
    />
    <div
      v-if="open"
      class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-default bg-default shadow-lg"
    >
      <button
        v-for="(s, i) in suggestions"
        :key="i"
        type="button"
        class="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-elevated"
        @mousedown.prevent="choose(s)"
      >
        <UIcon
          name="i-lucide-map-pin"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="min-w-0 truncate">{{ s.formatted }}</span>
      </button>
    </div>
  </div>
</template>
