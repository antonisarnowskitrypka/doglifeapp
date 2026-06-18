<script setup>
// Temporary placeholder shown on login-required pages when the user is anonymous —
// instead of forcing the auth modal open. TODO: replace with an illustration + marketing
// copy encouraging sign-up (per product direction).
const { t } = useI18n()
defineProps({
  title: { type: String, default: () => '' },
  description: { type: String, default: () => '' }
})

const { openSignup, openLogin } = useAuthModal()
</script>

<template>
  <UContainer class="py-12">
    <div class="max-w-md mx-auto text-center space-y-5">
      <div class="mx-auto flex items-center justify-center size-16 rounded-full bg-primary/10">
        <UIcon
          name="i-lucide-lock"
          class="size-7 text-primary"
        />
      </div>
      <div class="space-y-1">
        <h1 class="text-xl font-bold text-highlighted">
          {{ title || t('auth.teaser.title') }}
        </h1>
        <p class="text-muted text-sm">
          {{ description || t('auth.teaser.description') }}
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <UButton
          :label="$t('auth.actions.signup')"
          color="primary"
          @click="openSignup"
        />
        <UButton
          :label="$t('auth.actions.login')"
          color="neutral"
          variant="subtle"
          @click="openLogin"
        />
      </div>
    </div>
  </UContainer>
</template>
