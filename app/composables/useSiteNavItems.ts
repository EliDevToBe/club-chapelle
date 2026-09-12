import type { NavigationMenuItem } from "@nuxt/ui";
import { useAuthUser } from "./useAuthUser";

export const useSiteNavItems = () => {
  const route = useRoute();
  const { isAdmin, user } = useAuthUser();
  const { isEnabled } = useFeatureFlags();

  const competitionFlag = isEnabled("competition_dashboard");
  const facebookFeedFlag = isEnabled("facebook_feed");

  const baseNavItems = computed<NavigationMenuItem[]>(() => {
    const items: NavigationMenuItem[] = [];

    items.push({
      label: "Accueil",
      to: "/",
      active: route.path === "/" || route.path === "",
    });

    if (facebookFeedFlag.value) {
      items.push({
        label: "Actualités",
        to: "/feed",
        active: route.path.startsWith("/feed"),
      });
    }

    items.push(
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
    );

    if (user.value && competitionFlag.value) {
      items.push({
        label: "Compétitions",
        to: "/competitions",
        active: route.path.startsWith("/competitions"),
      });
    }

    return items;
  });

  /** Admin + settings links shown in the mobile drawer and desktop profile dropdown. */
  const accountNavItems = computed<NavigationMenuItem[]>(() => {
    if (!user.value) {
      return [];
    }

    const items: NavigationMenuItem[] = [];

    if (isAdmin.value) {
      items.push({
        label: "Admin",
        to: "/admin",
        active: route.path.startsWith("/admin"),
        color: "info",
        icon: "i-ph-shield-check-duotone",
      });
    }

    items.push({
      label: "Paramètres",
      to: "/settings",
      active: route.path.startsWith("/settings"),
      icon: "i-ph-gear-six-duotone",
    });

    return items;
  });

  const navItems = computed<NavigationMenuItem[][]>(() => {
    return [baseNavItems.value];
  });

  const drawerNavItems = computed<NavigationMenuItem[][]>(() => {
    const groups: NavigationMenuItem[][] = [baseNavItems.value];

    if (accountNavItems.value.length > 0) {
      groups.push(accountNavItems.value);
    }

    return groups;
  });

  return {
    navItems,
    drawerNavItems,
    accountNavItems,
  };
};
