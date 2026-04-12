import type { NavigationMenuItem } from "@nuxt/ui";

export const useSiteNavItems = () => {
  const route = useRoute();

  const navItems = computed<NavigationMenuItem[]>(() => {
    return [
      {
        label: "Accueil",
        to: "/",
        active: route.path === "/" || route.path === "",
      },
      {
        label: "Infos",
        to: "/infos",
        active: route.path.startsWith("/infos"),
      },
      {
        label: "Contact",
        to: "/contact",
        active: route.path.startsWith("/contact"),
      },
    ];
  });

  const actionItems = computed<NavigationMenuItem[]>(() => {
    return [
      {
        label: "Se connecter",
        to: "/login",
        active: route.path.startsWith("/login"),
        class:
          "text-secondary hover:text-secondary-300! active:text-secondary-600!",
      },
    ];
  });

  /** Grouped lists render a separator between groups in vertical `UNavigationMenu` (mobile drawer). */
  const drawerMenuItems = computed<NavigationMenuItem[][]>(() => [
    [...navItems.value, {}],
    actionItems.value,
  ]);

  return {
    navItems,
    drawerMenuItems,
  };
};
