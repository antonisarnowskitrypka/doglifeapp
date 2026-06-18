<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
const { t } = useI18n()
useHead({ title: t('appSettings.notifications.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('appSettings.notifications.title')"
    icon="i-lucide-bell-ring"
    :description="$t('appSettings.notifications.placeholder')"
  />
</template>
