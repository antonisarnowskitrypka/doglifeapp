<script setup>
// Main-category picker built on USelectMenu. The selected value renders as category chip(s) in the
// trigger (slot `#default` value), and each option is a category chip — selected = filled (soft),
// unselected = outline. Supports single (service.categoryKey) and multiple (org categoryKeys).
const props = defineProps({
  modelValue: { type: [String, Array], default: () => [] },
  // [{ label, value, icon, color }] — typically from SERVICE_CATEGORIES.
  items: { type: Array, default: () => [] },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

function keysOf(v) {
  if (Array.isArray(v)) return v
  return v ? [v] : []
}
const selectedKeys = computed(() => keysOf(props.modelValue))
function isSelected(value) {
  return selectedKeys.value.includes(value)
}
</script>

<template>
  <USelectMenu
    :model-value="modelValue"
    :items="items"
    value-key="value"
    :multiple="multiple"
    :placeholder="placeholder"
    class="w-full"
    @update:model-value="v => emit('update:modelValue', v)"
  >
    <template #default="{ modelValue: mv }">
      <span
        v-if="keysOf(mv).length"
        class="flex flex-wrap items-center gap-1"
      >
        <AppChip
          v-for="key in keysOf(mv)"
          :key="key"
          :color="serviceCategory(key)?.color || ''"
          :icon="serviceCategory(key)?.icon || ''"
          :label="serviceCategory(key)?.label || key"
        />
      </span>
      <span
        v-else
        class="text-dimmed"
      >{{ placeholder }}</span>
    </template>

    <template #item="{ item }">
      <AppChip
        :color="item.color"
        :icon="item.icon"
        :label="item.label"
        :variant="isSelected(item.value) ? 'soft' : 'outline'"
      />
    </template>
  </USelectMenu>
</template>
