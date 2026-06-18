<script setup>
definePageMeta({ layout: 'app', context: 'public' })
const { t } = useI18n()
useHead({ title: t('account.meta.title') })

const ctx = useContextStore()
const { user, changePassword, requestAccountDeletion } = useAuth()
const { authErrorMessage } = useAuthError()
const { apiErrorMessage } = useApiError()
const { openLogin } = useAuthModal()
const authFetch = useAuthFetch()
const toast = useToast()
const isLoggedIn = computed(() => !!user.value)

// Only email/password accounts can change a password; social-only accounts get a note instead.
const hasPassword = computed(() => !!user.value?.providerData?.some(p => p.providerId === 'password'))
const PROVIDER_LABELS = { 'google.com': 'Google', 'apple.com': 'Apple' }
const socialProviders = computed(() =>
  (user.value?.providerData || [])
    .map(p => PROVIDER_LABELS[p.providerId])
    .filter(Boolean)
    .join(' / ') || t('account.password.socialFallback')
)

const pw = reactive({ current: '', next: '', confirm: '' })
const pwSaving = ref(false)
function validatePw() {
  const e = []
  if (!pw.current) e.push({ name: 'current', message: t('validation.password.currentRequired') })
  if (!pw.next || pw.next.length < 6) e.push({ name: 'next', message: t('validation.password.min') })
  if (pw.confirm !== pw.next) e.push({ name: 'confirm', message: t('validation.password.mismatch') })
  return e
}
async function onChangePassword() {
  pwSaving.value = true
  try {
    await changePassword(pw.current, pw.next)
    pw.current = pw.next = pw.confirm = ''
    toast.add({ title: t('account.password.changed'), color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: authErrorMessage(e), color: 'error' })
  } finally {
    pwSaving.value = false
  }
}

// Soft account deletion: 7-day grace, reversible by signing back in (see useAuth).
const deleteOpen = ref(false)
const deleting = ref(false)
async function onDeleteAccount() {
  deleting.value = true
  try {
    await requestAccountDeletion()
    ctx.reset()
    deleteOpen.value = false
    toast.add({
      title: t('account.delete.scheduledTitle'),
      description: t('account.delete.scheduledBody'),
      color: 'info',
      icon: 'i-lucide-clock'
    })
    await navigateTo('/')
  } catch (e) {
    toast.add({ title: apiErrorMessage(e), color: 'error' })
  } finally {
    deleting.value = false
  }
}

const localeItems = computed(() => [
  { label: t('common.locales.pl'), value: 'pl' },
  { label: t('common.locales.en'), value: 'en' },
  { label: t('common.locales.bg'), value: 'bg' }
])

const form = reactive({ displayName: '', bio: '', phone: '', locale: 'pl', company: { name: '', taxId: '', address: '' } })
const saving = ref(false)

function hydrate() {
  const u = ctx.user || {}
  form.displayName = u.displayName || ''
  form.bio = u.bio || ''
  form.phone = u.phone || ''
  form.locale = u.locale || 'pl'
  form.company.name = u.companyDetails?.name || ''
  form.company.taxId = u.companyDetails?.taxId || ''
  form.company.address = u.companyDetails?.address || ''
}

onMounted(async () => {
  await ctx.load()
  hydrate()
})
watch(() => ctx.user, hydrate)

async function save() {
  saving.value = true
  try {
    const hasCompany = form.company.name || form.company.taxId || form.company.address
    await authFetch('/api/me', {
      method: 'PATCH',
      body: {
        displayName: form.displayName,
        bio: form.bio,
        phone: form.phone,
        locale: form.locale,
        companyDetails: hasCompany ? { ...form.company } : null
      }
    })
    await ctx.load(true)
    toast.add({ title: t('account.profile.saved'), color: 'success' })
  } catch (e) {
    toast.add({ title: apiErrorMessage(e, 'common.toast.saveError'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <!-- Context switcher at the very top on mobile (the "Więcej" hub); desktop has it in the rail. -->
    <AppContextSwitcher
      v-if="isLoggedIn"
      block
      class="lg:hidden"
    />

    <h1 class="text-2xl font-bold text-highlighted">
      {{ $t('account.title') }}
    </h1>

    <UAlert
      v-if="!isLoggedIn"
      color="info"
      variant="subtle"
      icon="i-lucide-lock"
      :title="$t('account.signinAlert.title')"
      :actions="[{ label: $t('auth.actions.login'), color: 'primary', onClick: openLogin }]"
    />

    <template v-else>
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('account.profile.title') }}
          </h2>
        </template>

        <div class="space-y-5">
          <AvatarUploader
            :src="ctx.user?.avatarUrl"
            endpoint="/api/me/avatar"
            :alt="form.displayName"
            @uploaded="ctx.load(true)"
          />

          <UFormField :label="$t('account.profile.displayName')">
            <UInput
              v-model="form.displayName"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="$t('account.profile.bio')"
            :hint="$t('common.labels.optional')"
          >
            <UTextarea
              v-model="form.bio"
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              :label="$t('account.profile.phone')"
              :hint="$t('common.labels.optional')"
            >
              <UInput
                v-model="form.phone"
                type="tel"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="$t('account.profile.language')">
              <USelectMenu
                v-model="form.locale"
                :items="localeItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('account.invoice.title') }}
          </h2>
          <p class="text-xs text-muted">
            {{ $t('account.invoice.subtitle') }}
          </p>
        </template>
        <div class="space-y-4">
          <UFormField :label="$t('account.invoice.companyName')">
            <UInput
              v-model="form.company.name"
              class="w-full"
            />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="$t('account.invoice.taxId')">
              <UInput
                v-model="form.company.taxId"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="$t('account.invoice.address')">
              <UInput
                v-model="form.company.address"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <div class="flex justify-end">
        <UButton
          :label="$t('common.actions.save')"
          color="primary"
          icon="i-lucide-check"
          :loading="saving"
          @click="save"
        />
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ $t('account.password.title') }}
          </h2>
        </template>

        <UForm
          v-if="hasPassword"
          :state="pw"
          :validate="validatePw"
          class="space-y-4"
          @submit="onChangePassword"
        >
          <UFormField
            :label="$t('account.password.current')"
            name="current"
          >
            <UInput
              v-model="pw.current"
              type="password"
              autocomplete="current-password"
              class="w-full"
            />
          </UFormField>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              :label="$t('account.password.new')"
              name="next"
              :hint="$t('auth.fields.passwordHint')"
            >
              <UInput
                v-model="pw.next"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="$t('account.password.confirm')"
              name="confirm"
            >
              <UInput
                v-model="pw.confirm"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="flex justify-end">
            <UButton
              type="submit"
              :label="$t('account.password.submit')"
              color="primary"
              icon="i-lucide-key-round"
              :loading="pwSaving"
            />
          </div>
        </UForm>

        <p
          v-else
          class="text-sm text-muted"
        >
          {{ $t('account.password.socialNote', { providers: socialProviders }) }}
        </p>
      </UCard>

      <UCard :ui="{ root: 'ring-error/30' }">
        <template #header>
          <h2 class="font-semibold text-error">
            {{ $t('account.delete.title') }}
          </h2>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{ $t('account.delete.description') }}
          </p>
          <div class="flex justify-end">
            <UButton
              :label="$t('account.delete.title')"
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              @click="deleteOpen = true"
            />
          </div>
        </div>
      </UCard>

      <UModal
        v-model:open="deleteOpen"
        :title="$t('account.delete.confirmTitle')"
      >
        <template #body>
          <div class="space-y-3 text-sm">
            <p>
              {{ $t('account.delete.confirmBody1') }}
            </p>
            <p class="text-muted">
              {{ $t('account.delete.confirmBody2') }}
            </p>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2 w-full">
            <UButton
              :label="$t('common.actions.cancel')"
              color="neutral"
              variant="ghost"
              @click="deleteOpen = false"
            />
            <UButton
              :label="$t('account.delete.confirmButton')"
              color="error"
              icon="i-lucide-trash-2"
              :loading="deleting"
              @click="onDeleteAccount"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UContainer>
</template>
