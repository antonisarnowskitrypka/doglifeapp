<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.calendar.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.calendar.placeholderTitle')"
    icon="i-lucide-calendar-days"
    :description="$t('provider.calendar.placeholderDescription')"
  />
</template>
