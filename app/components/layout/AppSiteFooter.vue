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
        to="https://archers-chapelle.sirv.com/chapelle/dakos.jpg"
        target="_blank"
        label="Avec ❤️ pour les Archers de La Chapelle"
        class="text-muted"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts"></script>

<style scoped lang=""></style>
