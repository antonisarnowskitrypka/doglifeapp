<script setup>
// Nudges email/password users to confirm their address. Social logins (Google/Apple)
// arrive pre-verified, so they never see this. Shown app-wide via layouts/app.vue.
const { user, sendVerification } = useAuth()
const toast = useToast()

const sending = ref(false)
const checking = ref(false)
// Firebase mutates `user.emailVerified` in place on reload() (no Vue reactivity), so we
// track a local override to hide the banner once we've confirmed it client-side.
const verifiedLocally = ref(false)

const show = computed(() => !verifiedLocally.value && !!user.value && user.value.emailVerified === false)

async function resend() {
  sending.value = true
  try {
    await sendVerification()
    toast.add({ title: 'Wysłaliśmy link weryfikacyjny.', description: `Sprawdź skrzynkę: ${user.value?.email}`, color: 'success' })
  } catch (e) {
    toast.add({ title: authErrorMessage(e), color: 'error' })
  } finally {
    sending.value = false
  }
}

async function recheck() {
  checking.value = true
  try {
    await user.value?.reload()
    if (user.value?.emailVerified) {
      verifiedLocally.value = true
      toast.add({ title: 'E-mail potwierdzony. Dziękujemy!', color: 'success', icon: 'i-lucide-mail-check' })
    } else {
      toast.add({ title: 'Jeszcze nie widzimy potwierdzenia.', description: 'Kliknij link w mailu, a potem spróbuj ponownie.', color: 'warning' })
    }
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <UAlert
    v-if="show"
    color="warning"
    variant="subtle"
    icon="i-lucide-mail-warning"
    title="Potwierdź swój adres e-mail"
    :description="`Wysłaliśmy link na ${user?.email}. Potwierdź adres, aby w pełni zabezpieczyć konto.`"
    class="m-4 mb-0"
    :actions="[
      { label: 'Wyślij ponownie', color: 'warning', variant: 'soft', loading: sending, onClick: resend },
      { label: 'Już potwierdziłem', color: 'neutral', variant: 'ghost', loading: checking, onClick: recheck }
    ]"
  />
</template>
