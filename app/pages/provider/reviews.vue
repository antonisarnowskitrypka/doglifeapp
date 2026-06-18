<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.reviews.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('provider.reviews.placeholderTitle')"
    icon="i-lucide-star"
    :description="$t('provider.reviews.placeholderDescription')"
  />
</template>
