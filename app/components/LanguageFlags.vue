<script setup>
// A row of small circular flags for the languages a staff member speaks.
// Reused on the team list (under the name) and in the staff-profile language picker.
const props = defineProps({
  // Language codes (pl, en, …) — see LANGUAGES / LANGUAGE_COUNTRY in app/utils/categories.ts.
  codes: { type: Array, default: () => [] },
  // Tailwind text-size utility controlling the flag size (each flag is 1em square).
  size: { type: String, default: 'text-sm' }
})

const flags = computed(() =>
  (props.codes || [])
    .map(code => ({ code, country: LANGUAGE_COUNTRY[code] }))
    .filter(f => f.country)
)
</script>

<template>
  <div
    v-if="flags.length"
    class="flex flex-wrap items-center gap-1"
  >
    <span
      v-for="f in flags"
      :key="f.code"
      role="img"
      class="fi fis fi-round shrink-0 ring-1 ring-black/10 dark:ring-white/15"
      :class="[`fi-${f.country}`, size]"
      :title="languageLabel(f.code)"
      :aria-label="languageLabel(f.code)"
    />
  </div>
</template>
