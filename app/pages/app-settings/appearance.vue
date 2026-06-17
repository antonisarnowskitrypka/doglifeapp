<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
useHead({ title: 'Wygląd — DogLife' })

// @nuxt/ui ships @nuxtjs/color-mode; `preference` is the persisted user choice
// ('system' | 'light' | 'dark'), backed by a cookie so it survives reloads.
const colorMode = useColorMode()
const theme = computed({
  get: () => colorMode.preference,
  set: (value) => { colorMode.preference = value }
})

const options = [
  { label: 'Jasny', value: 'light', description: 'Zawsze jasny motyw.' },
  { label: 'Ciemny', value: 'dark', description: 'Zawsze ciemny motyw.' },
  { label: 'Systemowy', value: 'system', description: 'Dopasuj do ustawień urządzenia.' }
]
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        Wygląd
      </h1>
      <p class="text-muted text-sm">
        Motyw aplikacji — zmiana działa od razu.
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Motyw
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
