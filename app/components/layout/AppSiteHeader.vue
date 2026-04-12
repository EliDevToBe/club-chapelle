<template>
  <UHeader
    to="/"
    v-model:open="isMenuOpen"
    :toggle="{ color: isMenuOpen ? 'secondary' : 'primary' }"
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
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import Title from "~/components/title/Title.vue";

const items = useSiteNavItems();

const isMenuOpen = ref(false);
</script>
