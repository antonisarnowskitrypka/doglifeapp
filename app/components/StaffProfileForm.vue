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

const authFetch = useAuthFetch()
const toast = useToast()

const form = reactive({
  shortDescription: props.initial.shortDescription || '',
  longDescription: props.initial.longDescription || '',
  languages: props.initial.languages || []
})
const avatarUrl = ref(props.initial.avatarUrl || '')
const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await authFetch(`/api/orgs/${props.orgId}/staff/${props.membershipId}`, {
      method: 'PATCH',
      body: {
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        languages: form.languages
      }
    })
    toast.add({ title: 'Zapisano profil.', color: 'success' })
    emit('saved')
  } catch (e) {
    toast.add({ title: e?.statusMessage || 'Nie udało się zapisać.', color: 'error' })
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
      label="Krótki opis"
      hint="przy nazwisku, do 160 znaków"
    >
      <UInput
        v-model="form.shortDescription"
        maxlength="160"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Pełny opis"
      hint="rozwijany „pokaż więcej”"
    >
      <UTextarea
        v-model="form.longDescription"
        :rows="4"
        autoresize
        class="w-full"
      />
    </UFormField>

    <UFormField label="Języki">
      <USelectMenu
        v-model="form.languages"
        :items="LANGUAGES"
        value-key="value"
        multiple
        class="w-full"
        placeholder="Wybierz języki"
      />
    </UFormField>

    <div class="flex justify-end">
      <UButton
        label="Zapisz"
        color="primary"
        icon="i-lucide-check"
        :loading="saving"
        @click="save"
      />
    </div>
  </div>
</template>
