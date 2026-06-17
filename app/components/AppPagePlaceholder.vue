<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  description: { type: String, default: 'Ten widok zdefiniujemy zgodnie z planem UI (ui-docs).' }
})
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <div class="flex items-center gap-3">
      <UIcon v-if="icon" :name="icon" class="size-7 text-primary" />
      <h1 class="text-2xl font-bold text-highlighted">
        {{ title }}
      </h1>
    </div>
    <UAlert color="info" variant="subtle" icon="i-lucide-construction" title="Ekran w budowie" :description="description" />
  </UContainer>
</template>
