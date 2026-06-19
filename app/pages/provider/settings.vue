<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.settingsHub.metaTitle') })

const ctx = useContextStore()
const isOwner = computed(() => ctx.activeContext.membership?.role === 'owner')

// Provider "Więcej" hub (mobile) — mirrors the desktop side-rail submenus.
// `ready: false` shows a "wkrótce" badge; the target page is a placeholder either way.
// `ownerOnly` sections (company settings) are hidden for staff.
const sections = computed(() => [
  {
    title: t('nav.myCard.title'),
    links: [
      { label: t('nav.myCard.profile'), description: t('provider.settingsHub.meProfileDescription'), icon: 'i-lucide-id-card', to: '/provider/me', ready: true },
      { label: t('nav.myCard.reviews'), description: t('provider.settingsHub.reviewsDescription'), icon: 'i-lucide-star', to: '/provider/reviews', ready: false }
    ]
  },
  {
    title: t('nav.companySettings.title'),
    ownerOnly: true,
    links: [
      { label: t('nav.companySettings.profile'), description: t('provider.settingsHub.companyProfileDescription'), icon: 'i-lucide-store', to: '/provider/profile', ready: true },
      { label: t('nav.companySettings.staff'), description: t('provider.settingsHub.staffDescription'), icon: 'i-lucide-users', to: '/provider/staff', ready: true },
      { label: t('nav.companySettings.services'), description: t('provider.settingsHub.servicesDescription'), icon: 'i-lucide-list', to: '/provider/services', ready: true },
      { label: t('nav.companySettings.locations'), description: t('provider.settingsHub.locationsDescription'), icon: 'i-lucide-map-pin', to: '/provider/locations', ready: true }
    ]
  },
  {
    title: t('nav.appSettings.title'),
    links: [
      { label: t('nav.appSettings.notifications'), description: t('provider.settingsHub.notificationsDescription'), icon: 'i-lucide-bell-ring', to: '/app-settings/notifications', ready: false },
      { label: t('nav.appSettings.language'), description: t('provider.settingsHub.languageDescription'), icon: 'i-lucide-languages', to: '/app-settings/language', ready: true },
      { label: t('nav.appSettings.appearance'), description: t('provider.settingsHub.appearanceDescription'), icon: 'i-lucide-sun-moon', to: '/app-settings/appearance', ready: true }
    ]
  }
].filter(section => !section.ownerOnly || isOwner.value))
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
                :label="$t('common.labels.soon')"
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
