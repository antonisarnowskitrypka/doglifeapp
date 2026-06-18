<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.dashboard.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.dashboard.placeholderTitle')"
    icon="i-lucide-layout-dashboard"
    :description="$t('provider.dashboard.placeholderDescription')"
  />
</template>
