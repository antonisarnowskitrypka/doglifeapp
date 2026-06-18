<script setup>
// Reusable image uploader (avatars + org logo). PUTs multipart to `endpoint`; the server
// validates type/size and returns the stored URL. Used for user avatar, org logo, staff avatar.
const props = defineProps({
  src: { type: String, default: '' },
  endpoint: { type: String, required: true },
  alt: { type: String, default: '' },
  icon: { type: String, default: 'i-lucide-user' },
  size: { type: String, default: '3xl' }
})
const emit = defineEmits(['uploaded'])

const authFetch = useAuthFetch()
const toast = useToast()
const { t } = useI18n()
const { apiErrorMessage } = useApiError()
const input = ref(null)
const uploading = ref(false)
const preview = ref(props.src || null)
watch(() => props.src, v => (preview.value = v || null))

function pick() {
  input.value?.click()
}

async function onChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const r = await authFetch(props.endpoint, { method: 'PUT', body: fd })
    preview.value = r.avatarUrl || r.logoUrl
    emit('uploaded', preview.value)
    toast.add({ title: t('common.uploader.saved'), color: 'success' })
  } catch (err) {
    toast.add({ title: apiErrorMessage(err, 'common.uploader.error'), color: 'error' })
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div class="flex items-center gap-4">
    <UAvatar
      :src="preview || undefined"
      :alt="alt"
      :icon="icon"
      :size="size"
    />
    <div>
      <input
        ref="input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        class="hidden"
        @change="onChange"
      >
      <UButton
        :label="preview ? $t('common.uploader.change') : $t('common.uploader.add')"
        icon="i-lucide-upload"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="uploading"
        @click="pick"
      />
      <p class="text-xs text-muted mt-1">
        {{ $t('common.uploader.hint') }}
      </p>
    </div>
  </div>
</template>
