<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
useHead({ title: 'Ustawienia firmy — DogLife' })

// Provider "Więcej" hub (mobile) — mirrors the desktop side-rail submenus.
// `ready: false` shows a "wkrótce" badge; the target page is a placeholder either way.
const sections = [
  {
    title: 'Moja wizytówka',
    links: [
      { label: 'Mój profil firmowy', description: 'Twój opis, języki, zdjęcie', icon: 'i-lucide-id-card', to: '/provider/me', ready: true },
      { label: 'Moje opinie', description: 'Opinie wystawione Tobie', icon: 'i-lucide-star', to: '/provider/reviews', ready: false }
    ]
  },
  {
    title: 'Ustawienia firmy',
    links: [
      { label: 'Profil firmy', description: 'Nazwa, opis, logo, dane do faktury', icon: 'i-lucide-store', to: '/provider/profile', ready: true },
      { label: 'Zespół', description: 'Pracownicy i zaproszenia', icon: 'i-lucide-users', to: '/provider/staff', ready: true },
      { label: 'Usługi', description: 'Oferta, tryby, ceny', icon: 'i-lucide-list', to: '/provider/services', ready: false },
      { label: 'Lokalizacje i godziny', description: 'Adresy, strefa czasowa, grafik', icon: 'i-lucide-map-pin', to: '/provider/locations', ready: false }
    ]
  },
  {
    title: 'Ustawienia aplikacji',
    links: [
      { label: 'Powiadomienia', description: 'Co i jak Cię informujemy', icon: 'i-lucide-bell-ring', to: '/app-settings/notifications', ready: false },
      { label: 'Język aplikacji', description: 'Język interfejsu', icon: 'i-lucide-languages', to: '/app-settings/language', ready: false },
      { label: 'Wygląd', description: 'Motyw jasny / ciemny', icon: 'i-lucide-sun-moon', to: '/app-settings/appearance', ready: true }
    ]
  }
]
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-8">
    <!-- Context switcher at the very top on mobile (the "Więcej" hub); desktop has it in the rail. -->
    <AppContextSwitcher
      block
      class="lg:hidden"
    />

    <div
      v-for="section in sections"
      :key="section.title"
      class="space-y-3"
    >
      <h2 class="text-sm font-semibold text-muted uppercase tracking-wide">
        {{ section.title }}
      </h2>

      <div class="grid gap-3 sm:grid-cols-2">
        <ULink
          v-for="link in section.links"
          :key="link.label"
          :to="link.to"
          class="rounded-lg border border-default p-4 flex items-start gap-3 transition-colors hover:bg-elevated"
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
        </ULink>
      </div>
    </div>
  </UContainer>
</template>
