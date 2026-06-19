<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
const { t, locale, locales, setLocale } = useI18n()
useHead({ title: t('appSettings.language.metaTitle') })

// Only `pl` is fully translated; en/bg fall back to pl until their catalogs land.
const TRANSLATED = new Set(['pl'])

const selected = computed({
  get: () => locale.value,
  set: (value) => { setLocale(value) }
})

const options = computed(() => locales.value.map(l => ({
  label: t(`common.locales.${l.code}`),
  value: l.code,
  description: TRANSLATED.has(l.code) ? undefined : t('common.labels.soon')
})))
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('appSettings.language.title') }}
      </h1>
      <p class="text-muted text-sm">
        {{ $t('appSettings.language.subtitle') }}
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          {{ $t('appSettings.language.heading') }}
        </h2>
      </template>

      <URadioGroup
        v-model="selected"
        :items="options"
      />

      <p class="text-muted text-xs mt-4">
        {{ $t('appSettings.language.note') }}
      </p>
    </UCard>
  </UContainer>
</template>
