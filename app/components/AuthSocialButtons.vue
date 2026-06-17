<script setup>
const emit = defineEmits(['success', 'error'])

const { signInWithGoogle, signInWithApple } = useAuth()
const loading = ref(null) // 'google' | 'apple' | null

async function run(provider, fn) {
  loading.value = provider
  try {
    await fn()
    emit('success')
  } catch (e) {
    // Popup closed by the user is not an error worth surfacing.
    if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
      emit('error', e?.message || 'Nie udało się zalogować przez dostawcę.')
    }
  } finally {
    loading.value = null
  }
}
</script>

<template>
  <div class="grid gap-2">
    <UButton
      icon="i-simple-icons-google"
      label="Kontynuuj z Google"
      color="neutral"
      variant="outline"
      block
      :loading="loading === 'google'"
      :disabled="loading !== null"
      @click="run('google', signInWithGoogle)"
    />
    <UButton
      icon="i-simple-icons-apple"
      label="Kontynuuj z Apple"
      color="neutral"
      variant="outline"
      block
      :loading="loading === 'apple'"
      :disabled="loading !== null"
      @click="run('apple', signInWithApple)"
    />
  </div>
</template>
