<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.finance.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.finance.placeholderTitle')"
    icon="i-lucide-chart-line"
    :description="$t('provider.finance.placeholderDescription')"
  />
</template>
