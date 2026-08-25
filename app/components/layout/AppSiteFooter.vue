<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-xs">
        Copyright © {{ new Date().getFullYear() }}
        {{ associationName }}
      </p>
    </template>

    <template #default>
      <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <UButton
          size="xs"
          color="neutral"
          variant="link"
          to="/legal-notice"
          label="Mentions légales"
          class="text-muted"
        />
        <UButton
          size="xs"
          color="neutral"
          variant="link"
          to="/privacy-policy"
          label="Confidentialité"
          class="text-muted"
        />
      </div>
    </template>

    <template #right>
      <UButton
        size="xs"
        trailing-icon="i-ph-github-logo-duotone"
        color="neutral"
        variant="link"
        to="https://archers-chapelle.sirv.com/Images/dakos.jpg"
        target="_blank"
        label="Avec ❤️ pour les Archers de La Chapelle"
        class="text-muted"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import { ASSOCIATION_LEGAL_NAME } from "~~/shared/website/site-settings.seed";

const associationName = ASSOCIATION_LEGAL_NAME;
</script>
