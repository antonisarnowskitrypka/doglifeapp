<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.locations.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.locations.placeholderTitle')"
    icon="i-lucide-map-pin"
    :description="$t('provider.locations.placeholderDescription')"
  />
</template>
