<template>
  <UHeader
    to="/"
    v-model:open="isMenuOpen"
    :toggle="{ color: isMenuOpen ? 'secondary' : 'primary' }"
    mode="drawer"
    :menu="{ direction: 'right' }"
  >
    <template #title>
      <Title density="compact" />
    </template>

    <UNavigationMenu :items="navItems" variant="link" class="min-w-0" />

    <template #right>
      <ChapButton
        to="/login"
        label="Se connecter"
        size="sm"
        variant="ghost"
        color="secondary"
        override-class="h-fit"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="drawerMenuItems"
        orientation="vertical"
        variant="link"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import Title from "~/components/title/Title.vue";
import ChapButton from "~/components/ui/ChapButton.vue";

const { navItems, drawerMenuItems } = useSiteNavItems();

const isMenuOpen = ref(false);
</script>
