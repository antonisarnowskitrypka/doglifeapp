<script setup>
const { state, close } = useAuthModal()
const { signInWithEmail, registerWithEmail } = useAuth()
const ctx = useContextStore()

const tabItems = [
  { label: 'Logowanie', value: 'login', slot: 'login' },
  { label: 'Rejestracja', value: 'signup', slot: 'signup' }
]

const login = reactive({ email: '', password: '' })
const signup = reactive({ displayName: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

watch(() => state.value.open, (open) => {
  if (!open) return
  error.value = ''
})

async function onSuccess() {
  close()
  await ctx.load(true)
  // Restore the last working context: jump to the provider shell if that was active.
  if (ctx.activeKey !== 'opiekun') await navigateTo('/provider')
}

function validateLogin(s) {
  const e = []
  if (!s.email) e.push({ name: 'email', message: 'Podaj e-mail' })
  if (!s.password) e.push({ name: 'password', message: 'Podaj hasło' })
  return e
}

function validateSignup(s) {
  const e = []
  if (!s.displayName) e.push({ name: 'displayName', message: 'Podaj imię' })
  if (!s.email) e.push({ name: 'email', message: 'Podaj e-mail' })
  if (!s.password || s.password.length < 6) e.push({ name: 'password', message: 'Hasło min. 6 znaków' })
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
    title="DogLife"
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
              <USeparator label="lub" />
              <UForm
                :state="login"
                :validate="validateLogin"
                class="space-y-4"
                @submit="onLogin"
              >
                <UFormField
                  label="E-mail"
                  name="email"
                >
                  <UInput
                    v-model="login.email"
                    type="email"
                    autocomplete="email"
                    placeholder="ty@przyklad.pl"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Hasło"
                  name="password"
                >
                  <UInput
                    v-model="login.password"
                    type="password"
                    autocomplete="current-password"
                    placeholder="••••••••"
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
                  label="Zaloguj się"
                  color="primary"
                  block
                  :loading="loading"
                />
              </UForm>
            </div>
          </template>

          <template #signup>
            <div class="space-y-5 pt-4">
              <AuthSocialButtons
                @success="onSuccess"
                @error="error = $event"
              />
              <USeparator label="lub" />
              <UForm
                :state="signup"
                :validate="validateSignup"
                class="space-y-4"
                @submit="onSignup"
              >
                <UFormField
                  label="Imię"
                  name="displayName"
                >
                  <UInput
                    v-model="signup.displayName"
                    autocomplete="name"
                    placeholder="Jak się do Ciebie zwracać?"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="E-mail"
                  name="email"
                >
                  <UInput
                    v-model="signup.email"
                    type="email"
                    autocomplete="email"
                    placeholder="ty@przyklad.pl"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Hasło"
                  name="password"
                  hint="min. 6 znaków"
                >
                  <UInput
                    v-model="signup.password"
                    type="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
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
                  label="Załóż konto"
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
