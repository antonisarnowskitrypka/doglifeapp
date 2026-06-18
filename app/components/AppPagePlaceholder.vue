<script setup>
const { t } = useI18n()
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  description: { type: String, default: () => '' }
})
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <div class="flex items-center gap-3">
      <UIcon
        v-if="icon"
        :name="icon"
        class="size-7 text-primary"
      />
      <h1 class="text-2xl font-bold text-highlighted">
        {{ title }}
      </h1>
    </div>
    <UAlert
      color="info"
      variant="subtle"
      icon="i-lucide-construction"
      :title="t('common.placeholder.title')"
      :description="description || t('common.placeholder.description')"
    />
  </UContainer>
</template>
