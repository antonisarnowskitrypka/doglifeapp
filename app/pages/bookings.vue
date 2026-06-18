<script setup>
definePageMeta({ layout: 'app', context: 'opiekun' })
const { t } = useI18n()
useHead({ title: t('opiekun.bookings.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('opiekun.bookings.title')"
    icon="i-lucide-calendar-check"
    :description="$t('opiekun.bookings.description')"
  />
</template>
