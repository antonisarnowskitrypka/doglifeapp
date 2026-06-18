<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
const { t } = useI18n()
useHead({ title: t('appSettings.appearance.metaTitle') })

// @nuxt/ui ships @nuxtjs/color-mode; `preference` is the persisted user choice
// ('system' | 'light' | 'dark'), backed by a cookie so it survives reloads.
const colorMode = useColorMode()
const theme = computed({
  get: () => colorMode.preference,
  set: (value) => { colorMode.preference = value }
})

const options = computed(() => [
  { label: t('appSettings.appearance.light'), value: 'light', description: t('appSettings.appearance.lightHint') },
  { label: t('appSettings.appearance.dark'), value: 'dark', description: t('appSettings.appearance.darkHint') },
  { label: t('appSettings.appearance.system'), value: 'system', description: t('appSettings.appearance.systemHint') }
])
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('appSettings.appearance.title') }}
      </h1>
      <p class="text-muted text-sm">
        {{ $t('appSettings.appearance.subtitle') }}
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          {{ $t('appSettings.appearance.themeHeading') }}
        </h2>
      </template>

      <!-- ClientOnly: color mode resolves on the client; avoids an SSR hydration mismatch. -->
      <ClientOnly>
        <URadioGroup
          v-model="theme"
          :items="options"
        />
        <template #fallback>
          <USkeleton class="h-24 w-full" />
        </template>
      </ClientOnly>
    </UCard>
  </UContainer>
</template>
