<script setup>
// Temporary placeholder shown on login-required pages when the user is anonymous —
// instead of forcing the auth modal open. TODO: replace with an illustration + marketing
// copy encouraging sign-up (per product direction).
defineProps({
  title: { type: String, default: 'Załóż konto, aby zobaczyć więcej' },
  description: {
    type: String,
    default: 'Ta sekcja jest dostępna po zalogowaniu. Załóż konto, aby rezerwować usługi i zarządzać zwierzakami.'
  }
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
          {{ title }}
        </h1>
        <p class="text-muted text-sm">
          {{ description }}
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <UButton
          label="Załóż konto"
          color="primary"
          @click="openSignup"
        />
        <UButton
          label="Zaloguj się"
          color="neutral"
          variant="subtle"
          @click="openLogin"
        />
      </div>
    </div>
  </UContainer>
</template>
