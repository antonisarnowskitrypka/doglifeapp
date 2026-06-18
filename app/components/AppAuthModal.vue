<script setup>
const { state, close } = useAuthModal()
const { signInWithEmail, registerWithEmail, sendPasswordReset } = useAuth()
const { authErrorMessage } = useAuthError()
const { t } = useI18n()
const ctx = useContextStore()

const tabItems = computed(() => [
  { label: t('auth.tabs.login'), value: 'login', slot: 'login' },
  { label: t('auth.tabs.signup'), value: 'signup', slot: 'signup' }
])

const login = reactive({ email: '', password: '' })
const signup = reactive({ displayName: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

// Inline "forgot password" — expands under the login form (no separate view).
const reset = reactive({ open: false, email: '', loading: false, sent: false, error: '' })

function toggleReset() {
  reset.open = !reset.open
  reset.error = ''
  reset.sent = false
  if (reset.open && !reset.email) reset.email = login.email
}

async function onReset() {
  reset.error = ''
  if (!reset.email) {
    reset.error = t('validation.email.required')
    return
  }
  reset.loading = true
  try {
    await sendPasswordReset(reset.email)
    reset.sent = true
  } catch (e) {
    // Don't reveal whether the account exists — treat "not found" as success.
    if (e?.code === 'auth/user-not-found') reset.sent = true
    else reset.error = authErrorMessage(e)
  } finally {
    reset.loading = false
  }
}

watch(() => state.value.open, (open) => {
  if (!open) return
  error.value = ''
  Object.assign(reset, { open: false, loading: false, sent: false, error: '' })
})

async function onSuccess() {
  close()
  await ctx.load(true)
  // Restore the last working context: jump to the provider shell if that was active.
  if (ctx.activeKey !== 'opiekun') await navigateTo('/provider')
}

function validateLogin(s) {
  const e = []
  if (!s.email) e.push({ name: 'email', message: t('validation.email.required') })
  if (!s.password) e.push({ name: 'password', message: t('validation.password.required') })
  return e
}

function validateSignup(s) {
  const e = []
  if (!s.displayName) e.push({ name: 'displayName', message: t('validation.name.required') })
  if (!s.email) e.push({ name: 'email', message: t('validation.email.required') })
  if (!s.password || s.password.length < 6) e.push({ name: 'password', message: t('validation.password.min') })
  return e
}

async function onLogin() {
  loading.value = true
  error.value = ''
  try {
    await signInWithEmail(login.email, login.password)
    await onSuccess()
  } catch (e) {
    error.value = authErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function onSignup() {
  loading.value = true
  error.value = ''
  try {
    await registerWithEmail(signup.email, signup.password, signup.displayName)
    await onSuccess()
  } catch (e) {
    error.value = authErrorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="state.open"
    :title="$t('common.appName')"
    :ui="{ content: 'max-w-sm' }"
  >
    <template #content>
      <div class="p-4 sm:p-6 space-y-5">
        <UTabs
          v-model="state.mode"
          :items="tabItems"
          variant="link"
          class="w-full"
        >
          <template #login>
            <div class="space-y-5 pt-4">
              <AuthSocialButtons
                @success="onSuccess"
                @error="error = $event"
              />
              <USeparator :label="$t('common.labels.or')" />
              <UForm
                :state="login"
                :validate="validateLogin"
                class="space-y-4"
                @submit="onLogin"
              >
                <UFormField
                  :label="$t('auth.fields.email')"
                  name="email"
                >
                  <UInput
                    v-model="login.email"
                    type="email"
                    autocomplete="email"
                    :placeholder="$t('auth.fields.emailPlaceholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :label="$t('auth.fields.password')"
                  name="password"
                >
                  <UInput
                    v-model="login.password"
                    type="password"
                    autocomplete="current-password"
                    :placeholder="$t('auth.fields.passwordPlaceholder')"
                    class="w-full"
                  />
                </UFormField>
                <UAlert
                  v-if="error"
                  color="error"
                  variant="subtle"
                  :title="error"
                  icon="i-lucide-circle-alert"
                />
                <UButton
                  type="submit"
                  :label="$t('auth.actions.login')"
                  color="primary"
                  block
                  :loading="loading"
                />
              </UForm>

              <div class="space-y-3">
                <UButton
                  variant="link"
                  color="neutral"
                  size="sm"
                  class="px-0"
                  :label="reset.open ? $t('common.actions.hide') : $t('auth.reset.trigger')"
                  @click="toggleReset"
                />
                <div
                  v-if="reset.open"
                  class="space-y-3 rounded-lg border border-default p-3"
                >
                  <UAlert
                    v-if="reset.sent"
                    color="success"
                    variant="subtle"
                    icon="i-lucide-mail-check"
                    :title="$t('auth.reset.sentTitle')"
                    :description="$t('auth.reset.sentBody', { email: reset.email })"
                  />
                  <template v-else>
                    <UFormField
                      :label="$t('auth.fields.email')"
                      :error="reset.error"
                    >
                      <UInput
                        v-model="reset.email"
                        type="email"
                        autocomplete="email"
                        :placeholder="$t('auth.fields.emailPlaceholder')"
                        class="w-full"
                      />
                    </UFormField>
                    <UButton
                      :label="$t('auth.reset.submit')"
                      color="neutral"
                      block
                      :loading="reset.loading"
                      @click="onReset"
                    />
                  </template>
                </div>
              </div>
            </div>
          </template>

          <template #signup>
            <div class="space-y-5 pt-4">
              <AuthSocialButtons
                @success="onSuccess"
                @error="error = $event"
              />
              <USeparator :label="$t('common.labels.or')" />
              <UForm
                :state="signup"
                :validate="validateSignup"
                class="space-y-4"
                @submit="onSignup"
              >
                <UFormField
                  :label="$t('auth.fields.name')"
                  name="displayName"
                >
                  <UInput
                    v-model="signup.displayName"
                    autocomplete="name"
                    :placeholder="$t('auth.fields.namePlaceholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :label="$t('auth.fields.email')"
                  name="email"
                >
                  <UInput
                    v-model="signup.email"
                    type="email"
                    autocomplete="email"
                    :placeholder="$t('auth.fields.emailPlaceholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  :label="$t('auth.fields.password')"
                  name="password"
                  :hint="$t('auth.fields.passwordHint')"
                >
                  <UInput
                    v-model="signup.password"
                    type="password"
                    autocomplete="new-password"
                    :placeholder="$t('auth.fields.passwordPlaceholder')"
                    class="w-full"
                  />
                </UFormField>
                <UAlert
                  v-if="error"
                  color="error"
                  variant="subtle"
                  :title="error"
                  icon="i-lucide-circle-alert"
                />
                <UButton
                  type="submit"
                  :label="$t('auth.actions.signup')"
                  color="primary"
                  block
                  :loading="loading"
                />
              </UForm>
            </div>
          </template>
        </UTabs>
      </div>
    </template>
  </UModal>
</template>
