<script setup>
definePageMeta({ layout: 'app', context: 'shared' })
const { t } = useI18n()
useHead({ title: t('appSettings.language.metaTitle') })
</script>

<template>
  <AppPagePlaceholder
    :title="$t('appSettings.language.title')"
    icon="i-lucide-languages"
    :description="$t('appSettings.language.placeholder')"
  />
</template>
