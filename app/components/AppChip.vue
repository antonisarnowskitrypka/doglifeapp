<script setup>
// A small colored pill used for locations (leading icon), staff (leading avatar/initials), and
// main service categories (leading icon, outline variant). Reused across services/locations lists,
// the service form selectors, and the category pickers.
const props = defineProps({
  // Chip color key (see app/utils/chips.ts). Empty → neutral pill.
  color: { type: String, default: '' },
  // Leading icon (locations/categories). When set, takes precedence over the avatar.
  icon: { type: String, default: '' },
  // Leading avatar (staff). Falls back to initials from `label` when no src.
  avatar: { type: String, default: null },
  label: { type: String, default: '' },
  // Render in a neutral grey state (e.g. an unselected toggle), ignoring `color`.
  muted: { type: Boolean, default: false },
  // 'soft' (filled, default) or 'outline' (border + text, no fill — used for category chips).
  variant: { type: String, default: 'soft' },
  // 'sm' (default) | 'md' | 'lg' — padding / text / icon size.
  size: { type: String, default: 'sm' }
})

const SIZES = {
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
  lg: 'gap-1.5 px-3 py-1.5 text-sm'
}

const cls = computed(() => {
  if (props.muted) return 'bg-elevated text-muted'
  if (props.variant === 'outline') return chipOutlineClass(props.color)
  return props.color ? chipClass(props.color) : 'bg-elevated text-muted'
})
const sizeCls = computed(() => SIZES[props.size] || SIZES.sm)
const iconCls = computed(() => (props.size === 'sm' ? 'size-3.5' : 'size-4'))
const avatarSize = computed(() => (props.size === 'sm' ? '3xs' : '2xs'))
</script>

<template>
  <span
    class="inline-flex max-w-full items-center rounded-full font-medium"
    :class="[sizeCls, cls]"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="shrink-0"
      :class="iconCls"
    />
    <UAvatar
      v-else-if="avatar !== null"
      :src="avatar || undefined"
      :alt="label"
      :size="avatarSize"
      class="-ml-1 shrink-0"
    />
    <span class="truncate">{{ label }}</span>
  </span>
</template>
