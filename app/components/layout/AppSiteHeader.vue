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

        <UDropdownMenu
          v-else
          :items="profileMenuItems"
          :content="{ align: 'end' }"
        >
          <UButton
            :label="displayName"
            variant="ghost"
            color="secondary"
            size="sm"
            trailing-icon="i-ph-caret-down"
            class="min-h-0 h-fit!"
          />
        </UDropdownMenu>
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
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import Title from "~/components/title/Title.vue";
import ChapButton from "~/components/ui/ChapButton.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";

const route = useRoute();
const { navItems, drawerNavItems } = useSiteNavItems();
const { user, logout } = useAuthUser();
const { addToastInfo } = useChapToast();

const isMenuOpen = ref(false);

const displayName = computed(() => {
  const accountName = user.value?.name?.trim();
  if (accountName) {
    return accountName;
  }

  const publicName = user.value?.public_name?.trim();
  if (publicName) {
    return publicName;
  }

  return "Mon compte";
});

const signOut = async () => {
  await logout();
  isMenuOpen.value = false;
  navigateTo("/");
  addToastInfo({
    title: "Vous avez été déconnecté",
  });
};

const profileMenuItems = computed<DropdownMenuItem[][]>(() => {
  return [
    [
      {
        label: "Paramètres",
        to: "/settings",
      },
    ],
    [
      {
        label: "Se déconnecter",
        onSelect: signOut,
        color: "error",
      },
    ],
  ];
});

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
      onSelect: signOut,
      class:
        "cursor-pointer text-error-500 hover:text-error-400! hover:bg-error/10 focus:bg-error/10 rounded-lg active:text-error-700!",
    });
  }

  return items;
});

/** Grouped lists render a separator between groups in vertical `UNavigationMenu` (mobile drawer). */
const drawerMenuItems = computed<NavigationMenuItem[][]>(() => [
  ...drawerNavItems.value,
  actionItems.value,
]);
</script>
