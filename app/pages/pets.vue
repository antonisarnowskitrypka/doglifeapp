<script setup>
definePageMeta({ layout: 'app', context: 'opiekun' })
const { t } = useI18n()
useHead({ title: t('opiekun.pets.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('opiekun.pets.title')"
    icon="i-lucide-paw-print"
    :description="$t('opiekun.pets.description')"
  />
</template>
