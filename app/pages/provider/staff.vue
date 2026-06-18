<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.staff.metaTitle') })

const ctx = useContextStore()
const authFetch = useAuthFetch()
const toast = useToast()
const { apiErrorMessage } = useApiError()

const orgId = computed(() => ctx.activeContext.membership?.organizationId)
const isOwner = computed(() => ctx.activeContext.membership?.role === 'owner')

const members = ref([])
const loading = ref(false)
const loadError = ref('')

async function loadStaff() {
  if (!orgId.value || !isOwner.value) return
  loading.value = true
  loadError.value = ''
  try {
    const r = await authFetch(`/api/orgs/${orgId.value}/staff`)
    members.value = r.members
  } catch (e) {
    loadError.value = apiErrorMessage(e, 'provider.staff.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ctx.load()
  loadStaff()
})
watch(orgId, loadStaff)

const email = ref('')
const inviting = ref(false)
const inviteError = ref('')

async function invite() {
  if (!email.value.trim()) return
  inviting.value = true
  inviteError.value = ''
  try {
    const r = await authFetch(`/api/orgs/${orgId.value}/staff`, { method: 'POST', body: { email: email.value.trim() } })
    toast.add({
      title: r.status === 'pending'
        ? t('provider.staff.invitePending')
        : t('provider.staff.invited'),
      color: 'success'
    })
    email.value = ''
    loadStaff()
  } catch (e) {
    inviteError.value = apiErrorMessage(e, 'provider.staff.inviteError')
  } finally {
    inviting.value = false
  }
}

async function remove(m) {
  try {
    await authFetch(`/api/orgs/${orgId.value}/staff/${m.membershipId}`, { method: 'DELETE' })
    loadStaff()
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'provider.staff.removeError'), color: 'error' })
  }
}

const STATUS = {
  active: { label: t('provider.staff.statusActive'), color: 'success' },
  invited: { label: t('provider.staff.statusInvited'), color: 'warning' },
  pending: { label: t('provider.staff.statusPending'), color: 'neutral' }
}

// Owner edits a member's per-org profile in a slideover.
const editing = ref(null)
const editOpen = computed({ get: () => !!editing.value, set: v => (editing.value = v ? editing.value : null) })
function onMemberSaved() {
  loadStaff()
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('provider.staff.title') }}
      </h1>
      <p class="text-muted text-sm">
        {{ $t('provider.staff.subtitle') }}
      </p>
    </div>

    <UAlert
      v-if="!isOwner"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :title="$t('provider.staff.notOwnerTitle')"
      :description="$t('provider.staff.notOwnerDescription')"
    />

    <template v-else>
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('provider.staff.inviteHeading') }}
          </h2>
        </template>
        <form
          class="flex flex-col sm:flex-row gap-2"
          @submit.prevent="invite"
        >
          <UInput
            v-model="email"
            type="email"
            :placeholder="$t('provider.staff.inviteEmailPlaceholder')"
            class="flex-1"
            autocomplete="off"
          />
          <UButton
            type="submit"
            :label="$t('provider.staff.inviteButton')"
            icon="i-lucide-user-plus"
            color="primary"
            :loading="inviting"
          />
        </form>
        <p
          v-if="inviteError"
          class="text-sm text-error mt-2"
        >
          {{ inviteError }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">
              {{ $t('provider.staff.membersHeading') }}
            </h2>
            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="loading"
              @click="loadStaff"
            />
          </div>
        </template>

        <p
          v-if="loadError"
          class="text-sm text-error"
        >
          {{ loadError }}
        </p>
        <div
          v-else
          class="divide-y divide-default"
        >
          <div
            v-for="m in members"
            :key="m.membershipId"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <UAvatar
              :alt="m.displayName || m.email"
              :icon="m.role === 'owner' ? 'i-lucide-crown' : 'i-lucide-user'"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">
                {{ m.displayName || m.email || $t('provider.staff.fallbackInvited') }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ m.email }}
              </p>
            </div>
            <UBadge
              :label="m.role === 'owner' ? $t('provider.staff.roleOwner') : $t('provider.staff.roleStaff')"
              variant="subtle"
              :color="m.role === 'owner' ? 'primary' : 'neutral'"
            />
            <UBadge
              :label="STATUS[m.status].label"
              :color="STATUS[m.status].color"
              variant="soft"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              :aria-label="$t('provider.staff.editAria')"
              @click="editing = m"
            />
            <UButton
              v-if="m.role !== 'owner'"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :aria-label="$t('provider.staff.removeAria')"
              @click="remove(m)"
            />
          </div>
        </div>
      </UCard>
    </template>

    <USlideover
      v-model:open="editOpen"
      :title="$t('provider.staff.editTitle', { name: editing?.displayName || editing?.email || '' })"
    >
      <template #body>
        <StaffProfileForm
          v-if="editing"
          :key="editing.membershipId"
          :org-id="orgId"
          :membership-id="editing.membershipId"
          :display-name="editing.displayName || editing.email"
          :initial="{
            shortDescription: editing.shortDescription,
            longDescription: editing.longDescription,
            languages: editing.languages,
            avatarUrl: editing.avatarUrl
          }"
          @saved="onMemberSaved"
        />
      </template>
    </USlideover>
  </UContainer>
</template>
