<template>
  <UHeader
    v-model:open="isMenuOpen"
    :toggle="{ color: isMenuOpen ? 'secondary' : 'primary' }"
    mode="drawer"
    :menu="{
      direction: 'right',
    }"
    title="Les Archers de la Chapelle"
  >
    <template #title>
      <Title density="compact" />
    </template>

    <UNavigationMenu :items="navItems" variant="link" class="min-w-0" />

    <template #right>
      <div class="hidden md:flex items-center">
        <ChapButton
          v-if="!user"
          to="/login"
          label="Se connecter"
          size="sm"
          variant="ghost"
          color="secondary"
          additional-class="min-h-0 h-fit!"
        />

        <ChapButton
          v-else
          @click="
            async () => {
              await logout();
              navigateTo('/');
              addToastInfo({
                title: 'Vous avez été déconnecté',
              });
            }
          "
          label="Se déconnecter"
          size="sm"
          variant="ghost"
          color="error"
          additional-class="min-h-0 h-fit!"
        />
      </div>
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
import type { NavigationMenuItem } from "@nuxt/ui";
import Title from "~/components/title/Title.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";

const route = useRoute();
const { navItems } = useSiteNavItems();
const { user, logout } = useAuthUser();
const { addToastInfo } = useChapToast();

const isMenuOpen = ref(false);

const actionItems = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [];

  if (!user.value) {
    items.push({
      label: "Se connecter",
      to: "/login",
      active: route.path.startsWith("/login"),
      class:
        "cursor-pointer text-secondary-500 hover:text-secondary-300! active:text-secondary-600!",
    });
  } else {
    items.push({
      label: "Se déconnecter",
      onSelect: async () => {
        await logout();
        isMenuOpen.value = false;
        navigateTo("/");
        addToastInfo({
          title: "Vous avez été déconnecté",
        });
      },
      class:
        "cursor-pointer text-error-500 hover:text-error-400! hover:bg-error/10 focus:bg-error/10 rounded-lg active:text-error-700!",
    });
  }

  return items;
});

/** Grouped lists render a separator between groups in vertical `UNavigationMenu` (mobile drawer). */
const drawerMenuItems = computed<NavigationMenuItem[][]>(() => [
  ...navItems.value,
  actionItems.value,
]);
</script>
