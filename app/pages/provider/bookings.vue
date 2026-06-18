<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.bookings.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.bookings.placeholderTitle')"
    icon="i-lucide-inbox"
    :description="$t('provider.bookings.placeholderDescription')"
  />
</template>
