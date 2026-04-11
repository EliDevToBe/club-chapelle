<template>
  <UHeader
    to="/"
    :ui="{
      center: 'hidden md:flex',
      toggle: 'md:hidden',
      content: 'md:hidden',
      overlay: 'md:hidden',
      left: 'md:flex-1 flex items-center gap-1.5',
      right: 'md:flex-1 flex items-center justify-end gap-1.5',
    }"
  >
    <template #title>
      <Title density="compact" />
    </template>

    <UNavigationMenu :items="items" variant="link" class="min-w-0" />

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        variant="link"
        class="-mx-2.5 w-full"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import Title from "~/components/title/Title.vue";

const items = useSiteNavItems();
</script>
