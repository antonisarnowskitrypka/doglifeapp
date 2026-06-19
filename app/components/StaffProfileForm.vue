<script setup>
// Edits a staff member's per-org profile (blurb, languages, org-scoped avatar).
// Used both by the member themselves (/provider/me) and by an owner editing a member.
const props = defineProps({
  orgId: { type: String, required: true },
  membershipId: { type: String, required: true },
  initial: { type: Object, default: () => ({}) },
  displayName: { type: String, default: '' }
})
const emit = defineEmits(['saved'])

const { t } = useI18n()
const { apiErrorMessage } = useApiError()
const authFetch = useAuthFetch()
const toast = useToast()

const form = reactive({
  shortDescription: props.initial.shortDescription || '',
  longDescription: props.initial.longDescription || '',
  languages: props.initial.languages || []
})
const avatarUrl = ref(props.initial.avatarUrl || '')
const color = ref(props.initial.color || '')
const saving = ref(false)

// Colors already taken by OTHER members — disabled in the picker (server also enforces uniqueness).
const takenColors = ref(new Set())
const colorOpen = ref(false)
onMounted(async () => {
  try {
    const res = await authFetch(`/api/orgs/${props.orgId}/staff/colors`)
    takenColors.value = new Set((res.used || []).filter(u => u.membershipId !== props.membershipId).map(u => u.color))
  } catch {
    // non-critical — the picker just won't pre-disable taken colors
  }
})
function pickColor(key) {
  if (takenColors.value.has(key) && key !== color.value) return
  color.value = color.value === key ? '' : key // click the current one again to clear
  colorOpen.value = false
}

async function save() {
  saving.value = true
  try {
    await authFetch(`/api/orgs/${props.orgId}/staff/${props.membershipId}`, {
      method: 'PATCH',
      body: {
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        languages: form.languages,
        color: color.value || null
      }
    })
    toast.add({ title: t('provider.staffForm.saved'), color: 'success' })
    emit('saved')
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <AvatarUploader
      :src="avatarUrl"
      :endpoint="`/api/orgs/${orgId}/staff/${membershipId}/avatar`"
      :alt="displayName"
      icon="i-lucide-user"
      @uploaded="(url) => { avatarUrl = url; emit('saved') }"
    />

    <UFormField
      :label="$t('provider.staffForm.color')"
      :hint="$t('provider.staffForm.colorHint')"
    >
      <UPopover v-model:open="colorOpen">
        <UButton
          color="neutral"
          variant="outline"
          class="gap-2"
        >
          <span
            class="size-6 rounded-full"
            :class="color ? chipSwatch(color) : 'border border-default bg-elevated'"
          />
          <span class="text-sm">{{ color ? $t('provider.staffForm.colorChange') : $t('provider.staffForm.colorPick') }}</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4"
          />
        </UButton>
        <template #content>
          <div class="grid grid-cols-6 gap-1.5 p-2">
            <button
              v-for="c in STAFF_COLORS"
              :key="c.key"
              type="button"
              :disabled="takenColors.has(c.key) && c.key !== color"
              class="size-7 rounded-full ring-2 ring-offset-2 ring-offset-default transition disabled:cursor-not-allowed disabled:opacity-20"
              :class="[c.swatch, color === c.key ? 'ring-primary' : 'ring-transparent']"
              :aria-label="$t(`common.colors.${c.key}`)"
              @click="pickColor(c.key)"
            />
          </div>
        </template>
      </UPopover>
    </UFormField>

    <UFormField
      :label="$t('provider.staffForm.shortDescription')"
      :hint="$t('provider.staffForm.shortDescriptionHint')"
    >
      <UInput
        v-model="form.shortDescription"
        maxlength="160"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="$t('provider.staffForm.longDescription')"
      :hint="$t('provider.staffForm.longDescriptionHint')"
    >
      <UTextarea
        v-model="form.longDescription"
        :rows="4"
        autoresize
        class="w-full"
      />
    </UFormField>

    <UFormField :label="$t('provider.staffForm.languages')">
      <USelectMenu
        v-model="form.languages"
        :items="LANGUAGES"
        value-key="value"
        multiple
        class="w-full"
        :placeholder="$t('provider.staffForm.languagesPlaceholder')"
      >
        <template #item-leading="{ item }">
          <LanguageFlags :codes="[item.value]" />
        </template>
      </USelectMenu>
      <LanguageFlags
        :codes="form.languages"
        size="text-base"
        class="mt-2"
      />
    </UFormField>

    <div class="flex justify-end">
      <UButton
        :label="$t('common.actions.save')"
        color="primary"
        icon="i-lucide-check"
        :loading="saving"
        @click="save"
      />
    </div>
  </div>
</template>
