<script setup>
definePageMeta({ layout: 'app', context: 'public' })
const { t } = useI18n()
useHead({ title: t('opiekun.search.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('opiekun.search.title')"
    icon="i-lucide-search"
    :description="$t('opiekun.search.description')"
  />
</template>
