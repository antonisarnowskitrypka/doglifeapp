<script setup>
// Nudges email/password users to confirm their address. Social logins (Google/Apple)
// arrive pre-verified, so they never see this. Shown app-wide via layouts/app.vue.
const { user, sendVerification } = useAuth()
const { authErrorMessage } = useAuthError()
const { t } = useI18n()
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
    toast.add({ title: t('auth.verify.sentTitle'), description: t('auth.verify.sentBody', { email: user.value?.email }), color: 'success' })
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
      toast.add({ title: t('auth.verify.confirmedTitle'), color: 'success', icon: 'i-lucide-mail-check' })
    } else {
      toast.add({ title: t('auth.verify.notYetTitle'), description: t('auth.verify.notYetBody'), color: 'warning' })
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
    :title="t('auth.verify.title')"
    :description="t('auth.verify.body', { email: user?.email })"
    class="m-4 mb-0"
    :actions="[
      { label: t('auth.verify.resend'), color: 'warning', variant: 'soft', loading: sending, onClick: resend },
      { label: t('auth.verify.recheck'), color: 'neutral', variant: 'ghost', loading: checking, onClick: recheck }
    ]"
  />
</template>
