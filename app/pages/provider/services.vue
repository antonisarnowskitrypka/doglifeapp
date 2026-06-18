<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.services.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.services.placeholderTitle')"
    icon="i-lucide-list"
    :description="$t('provider.services.placeholderDescription')"
  />
</template>
