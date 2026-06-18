<script setup>
definePageMeta({ layout: 'app', context: 'provider' })
const { t } = useI18n()
useHead({ title: t('provider.me.metaTitle') })

const ctx = useContextStore()
const m = computed(() => ctx.activeContext.membership)

onMounted(() => ctx.load())
</script>

<template>
  <UContainer class="py-8 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('nav.myCard.profile') }}
      </h1>
      <p class="text-muted text-sm">
        {{ $t('provider.me.subtitle', { organizationName: m?.organizationName }) }}
      </p>
    </div>

    <UCard v-if="m">
      <StaffProfileForm
        :key="m.membershipId"
        :org-id="m.organizationId"
        :membership-id="m.membershipId"
        :display-name="ctx.user?.displayName"
        :initial="{
          shortDescription: m.shortDescription,
          longDescription: m.longDescription,
          languages: m.languages,
          avatarUrl: m.avatarUrl
        }"
        @saved="ctx.load(true)"
      />
    </UCard>
  </UContainer>
</template>
