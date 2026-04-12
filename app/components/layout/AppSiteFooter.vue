<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }} Les Archers de La Chapelle
      </p>
    </template>

    <template #right>
      <UButton
        size="xs"
        trailing-icon="i-ph-github-logo-duotone"
        color="neutral"
        variant="link"
        to="https://github.com/user-attachments/assets/517348e2-eb57-4c8a-ad5c-2cbef464013a"
        target="_blank"
        label="Avec ❤️ pour les Archers de La Chapelle"
        class="text-muted"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts"></script>

<style scoped lang=""></style>
