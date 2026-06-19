<script setup>
// A small colored pill used for locations (leading icon) and staff (leading avatar/initials).
// Reused on the services list, the service form selectors, and the locations list.
const props = defineProps({
  // Chip color key (see app/utils/chips.ts). Empty → neutral pill.
  color: { type: String, default: '' },
  // Leading icon (locations). When set, takes precedence over the avatar.
  icon: { type: String, default: '' },
  // Leading avatar (staff). Falls back to initials from `label` when no src.
  avatar: { type: String, default: null },
  label: { type: String, default: '' },
  // Render in a neutral grey state (e.g. an unselected toggle), ignoring `color`.
  muted: { type: Boolean, default: false }
})

const cls = computed(() => (props.muted || !props.color ? 'bg-elevated text-muted' : chipClass(props.color)))
</script>

<template>
  <span
    class="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    :class="cls"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="size-3.5 shrink-0"
    />
    <UAvatar
      v-else-if="avatar !== null"
      :src="avatar || undefined"
      :alt="label"
      size="3xs"
      class="-ml-1 shrink-0"
    />
    <span class="truncate">{{ label }}</span>
  </span>
</template>
