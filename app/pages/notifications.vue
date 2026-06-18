<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
const { t } = useI18n()
useHead({ title: t('opiekun.notifications.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('opiekun.notifications.title')"
    icon="i-lucide-bell"
    :description="$t('opiekun.notifications.description')"
  />
</template>
