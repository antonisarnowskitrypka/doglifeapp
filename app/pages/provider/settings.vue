<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
useHead({ title: 'Ustawienia firmy — DogLife' })

// Resolve the real NuxtLink component — passing the string 'NuxtLink' to <component :is>
// doesn't reliably produce a navigating link.
const NuxtLink = resolveComponent('NuxtLink')

// Provider "Więcej" hub — quick links. Most are placeholders (Faza B); Zespół is live.
const links = [
  { label: 'Profil firmy', description: 'Nazwa, opis, logo, dane do faktury', icon: 'i-lucide-store', to: '/provider/profile', ready: true },
  { label: 'Mój profil w firmie', description: 'Twój opis, języki, zdjęcie', icon: 'i-lucide-id-card', to: '/provider/me', ready: true },
  { label: 'Zespół', description: 'Pracownicy i zaproszenia', icon: 'i-lucide-users', to: '/provider/staff', ready: true },
  { label: 'Usługi', description: 'Oferta, tryby, ceny', icon: 'i-lucide-list', to: '/provider/services', ready: false },
  { label: 'Lokalizacje i godziny', description: 'Adresy, strefa czasowa, grafik', icon: 'i-lucide-map-pin', to: '/provider/settings', ready: false }
]
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <!-- Context switcher at the very top on mobile (the "Więcej" hub); desktop has it in the rail. -->
    <AppContextSwitcher
      block
      class="lg:hidden"
    />

    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        Ustawienia firmy
      </h1>
      <p class="text-muted text-sm">
        Zarządzaj firmą — zespół, usługi, profil. (Część w budowie.)
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <component
        :is="link.ready ? NuxtLink : 'div'"
        v-for="link in links"
        :key="link.label"
        :to="link.ready ? link.to : undefined"
        class="rounded-lg border border-default p-4 flex items-start gap-3 transition-colors"
        :class="link.ready ? 'hover:bg-elevated cursor-pointer' : 'opacity-60'"
      >
        <UIcon
          :name="link.icon"
          class="size-5 text-primary shrink-0 mt-0.5"
        />
        <div class="min-w-0">
          <p class="font-medium flex items-center gap-2">
            {{ link.label }}
            <UBadge
              v-if="!link.ready"
              label="wkrótce"
              color="neutral"
              variant="subtle"
              size="sm"
            />
          </p>
          <p class="text-xs text-muted">
            {{ link.description }}
          </p>
        </div>
      </component>
    </div>
  </UContainer>
</template>
