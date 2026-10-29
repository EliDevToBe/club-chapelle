<template>
  <UHeader
    v-model:open="isMenuOpen"
    :class="[ui.root, isScrolled ? ui.rootScrolled : ui.rootTop]"
    :ui="{ toggle: ui.toggle }"
    :toggle="{ color: 'primary', variant: 'ghost', size: 'xl' }"
    mode="drawer"
    :menu="{
      direction: 'right',
    }"
    title="Les Archers de la Chapelle"
  >
    <template #title>
      <ArcherGlyph :class="ui.logo" />
      <span class="sr-only">Les Archers de la Chapelle — accueil</span>
    </template>

    <template #right>
      <div :class="ui.desktopNav">
        <UNavigationMenu
          :items="navItems"
          variant="link"
          :ui="{ list: ui.navList, link: ui.navLink }"
          aria-label="Navigation principale"
        />

        <ULink
          v-if="!user"
          to="/login"
          :class="ui.navLink"
          active-class="underline"
        >
          Se connecter
        </ULink>

        <UDropdownMenu
          v-else
          :items="profileMenuItems"
          :content="{ align: 'end' }"
        >
          <button type="button" :class="[ui.navLink, ui.accountTrigger]">
            {{ displayName }}
            <UIcon name="i-ph-caret-down-bold" class="size-4" />
          </button>
        </UDropdownMenu>
      </div>
    </template>

    <template #body>
      <UNavigationMenu
        :items="drawerMenuItems"
        orientation="vertical"
        variant="link"
        :ui="{ link: ui.drawerLink }"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import ArcherGlyph from "~/components/brand/ArcherGlyph.vue";
import { useAuthUser } from "~/composables/useAuthUser";
import { useChapToast } from "~/composables/useChapToasts";

/** Past this offset the header turns into the dark translucent bar so orange stays legible over content. */
const SCROLLED_THRESHOLD_PX = 8;

const route = useRoute();
const { navItems, drawerNavItems, accountNavItems } = useSiteNavItems();
const { user, logout } = useAuthUser();
const { addToastInfo } = useChapToast();

const isMenuOpen = ref(false);
const isScrolled = ref(false);

const updateScrolled = () => {
  isScrolled.value = window.scrollY > SCROLLED_THRESHOLD_PX;
};

onMounted(() => {
  updateScrolled();
  window.addEventListener("scroll", updateScrolled, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScrolled);
});

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
  const primaryGroup: DropdownMenuItem[] = accountNavItems.value.map((item) => {
    return {
      label: item.label,
      to: item.to,
      class: item.class,
      color: item.color,
      icon: item.icon,
    };
  });

  return [
    primaryGroup,
    [
      {
        label: "Se déconnecter",
        onSelect: signOut,
        color: "error",
        icon: "i-ph-sign-out-duotone",
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
    });
  } else {
    items.push({
      label: "Se déconnecter",
      ui: {
        linkLeadingIcon: "text-error group-hover:text-error!",
      },
      onSelect: signOut,
      icon: "i-ph-sign-out-duotone",
      class: "cursor-pointer text-error! hover:text-error!",
    });
  }

  return items;
});

/** Same-URL taps (e.g. Contact while on `/#contact`) don't navigate, so close the drawer explicitly. */
const withMenuClose = (item: NavigationMenuItem): NavigationMenuItem => {
  return {
    ...item,
    onSelect: (event: Event) => {
      item.onSelect?.(event);
      isMenuOpen.value = false;
    },
  };
};

/** Grouped lists render a separator between groups in vertical `UNavigationMenu` (mobile drawer). */
const drawerMenuItems = computed<NavigationMenuItem[][]>(() => {
  return [...drawerNavItems.value, actionItems.value].map((group) => {
    return group.map(withMenuClose);
  });
});

const ui = {
  root: "border-b-0 transition-colors duration-300",
  rootTop: "bg-transparent backdrop-blur-none",
  rootScrolled: "dark bg-default/85 backdrop-blur-md",
  logo: "h-9 md:h-11 text-primary-500",
  toggle: "md:hidden",
  desktopNav: "hidden md:flex items-center gap-8",
  navList: "gap-8",
  navLink: [
    "px-0 py-1 font-label font-bold uppercase tracking-wide text-base",
    "text-primary! hover:underline underline-offset-6 decoration-2 before:hidden",
    // The menu's default focus ring is drawn on `::before`, hidden above, so restore a visible one.
    "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
  ],
  accountTrigger: "inline-flex items-center gap-1.5 cursor-pointer",
  drawerLink:
    "justify-end font-label font-bold uppercase tracking-wide text-lg text-primary!",
};
</script>
